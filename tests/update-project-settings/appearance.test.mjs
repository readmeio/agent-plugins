import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { after, describe, test } from 'node:test';

import { expectRejected, expectWrite, pickDifferent } from './lib/assertions.mjs';
import { patchProject, uploadFile } from './lib/client.mjs';
import { hasPlanFeature, planSkip } from './lib/plan-features.mjs';
import { DESTRUCTIVE_SKIP, loadProfiles } from './lib/profiles.mjs';
import { createSession, getPath } from './lib/snapshot.mjs';

const profiles = await loadProfiles();

const fixture = name => fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url));

async function uploadImage(session, name, mimeType) {
  const res = await uploadFile(session.profile.key, 'v2/images', fixture(name), mimeType);
  assert.equal(res.status, 201, `image upload on ${session.profile.id}: ${JSON.stringify(res.body)}`);
  return res.body.data.uri;
}

// Local environments often lack font storage credentials; any other failure must fail the test.
async function uploadFont(t, session, slot) {
  const res = await uploadFile(session.profile.key, `v2/fonts/${slot}`, fixture('test-font.woff2'), 'font/woff2');
  if (res.status >= 500 && res.body?.title === 'AccessDenied') {
    t.skip(`font storage credentials are not configured in this environment: ${res.status} ${res.body.detail}`);
    return null;
  }
  assert.equal(res.status, 201, `font upload to ${slot} on ${session.profile.id}: ${JSON.stringify(res.body)}`);
  return res.body.data;
}

const HEADING_FONT = 'appearance.typography.custom_heading.url';
const BODY_FONT = 'appearance.typography.custom_body.regular.url';

for (const profile of profiles) {
  describe(`appearance settings: ${profile.id}`, () => {
    const session = createSession(profile);
    after(() => session.restore());

    const usability = hasPlanFeature(profile, 'usability');

    describe('Brand and theme', () => {
      // A legacy main logo has no `uri`, so it cannot be restored once replaced.
      const legacyMainLogo = profile.project.appearance.logo.main.uri === null;
      let mainLogoSkip = false;
      if (legacyMainLogo) mainLogoSkip = DESTRUCTIVE_SKIP;

      test('Upload or change the main logo', { skip: mainLogoSkip }, async () => {
        const uri = await uploadImage(session, 'readme_light.svg', 'image/svg+xml');
        const restoreWith = {};
        if (legacyMainLogo) restoreWith['appearance.logo.main.uri'] = uri;
        const res = await session.patch({ appearance: { logo: { main: { uri } } } }, { restoreWith });
        assert.equal(res.status, 200, JSON.stringify(res.body));
        const project = await session.current();
        assert.equal(project.appearance.logo.main.uri, uri);
      });

      test('The main logo cannot be removed', async () => {
        // Sent outside the session so restore never replays the rejected null.
        const res = await patchProject(profile.key, { appearance: { logo: { main: { uri: null } } } });
        assert.ok(res.status >= 400 && res.status < 500, `expected a 4xx, got ${res.status}`);
      });

      test('Upload or change the dark-mode logo', async () => {
        const uri = await uploadImage(session, 'readme_dark.svg', 'image/svg+xml');
        await expectWrite(session, () => ({ appearance: { logo: { dark_mode: { uri } } } }));
      });

      test('Set the logo size', async () => {
        await expectWrite(session, project => ({
          appearance: { logo: { size: pickDifferent(project.appearance.logo.size, ['medium', 'large']) } },
        }));
      });

      test('Upload or change the favicon', async () => {
        const uri = await uploadImage(session, 'readme.ico', 'image/x-icon');
        await expectWrite(session, () => ({ appearance: { logo: { favicon: { uri } } } }));
      });

      test('Apply a theme preset (only the preset field changes)', async () => {
        const { before, after: updated } = await expectWrite(session, project => ({
          appearance: {
            brand: { theme_preset: pickDifferent(project.appearance.brand.theme_preset, ['snowy_owl', 'hawk_owl']) },
          },
        }));
        assert.equal(updated.appearance.layout.style, before.appearance.layout.style);
        assert.equal(updated.appearance.border_radius, before.appearance.border_radius);
      });

      test('Set the default color mode', async () => {
        await expectWrite(session, project => ({
          appearance: { brand: { theme: pickDifferent(project.appearance.brand.theme, ['dark', 'light']) } },
        }));
      });

      test('Set the primary and link colors', async () => {
        await expectWrite(session, project => {
          const { brand } = project.appearance;
          return {
            appearance: {
              brand: {
                primary_color: pickDifferent(brand.primary_color, ['#7a3cff', '#00875a']),
                primary_color_dark: pickDifferent(brand.primary_color_dark, ['#b794ff', '#4fd1a5']),
                link_color: pickDifferent(brand.link_color, ['#0057d9', '#c2410c']),
                link_color_dark: pickDifferent(brand.link_color_dark, ['#7fb0ff', '#fb923c']),
              },
            },
          };
        });
      });

      test('Fine-tune background, border, header, sidebar, breadcrumb, and Ask AI colors', async () => {
        await expectWrite(session, project => {
          const { brand } = project.appearance;
          return {
            appearance: {
              brand: {
                background: {
                  color: pickDifferent(brand.background.color, ['#fafaf7', '#f5f5f5']),
                  color_dark: pickDifferent(brand.background.color_dark, ['#16161a', '#1e1d1a']),
                  tint: pickDifferent(brand.background.tint, ['#e0e7ff', '#fde68a']),
                  tint_dark: pickDifferent(brand.background.tint_dark, ['#312e81', '#78350f']),
                },
                border: {
                  color: pickDifferent(brand.border.color, ['rgba(0,0,0,0.12)', '#e5e5e5']),
                  color_dark: pickDifferent(brand.border.color_dark, ['rgba(255,255,255,0.1)', '#333333']),
                },
                header: {
                  color: pickDifferent(brand.header.color, ['#ffffff', 'transparent']),
                  color_dark: pickDifferent(brand.header.color_dark, ['#111111', 'transparent']),
                },
                sidebar: {
                  border: pickDifferent(brand.sidebar.border, ['transparent', '#dddddd']),
                  border_dark: pickDifferent(brand.sidebar.border_dark, ['transparent', '#222222']),
                },
                breadcrumbs: {
                  color: pickDifferent(brand.breadcrumbs.color, ['var(--color-link-primary)', '#555555']),
                  color_dark: pickDifferent(brand.breadcrumbs.color_dark, ['#aaaaaa', '#bbbbbb']),
                },
                askai: {
                  color: pickDifferent(brand.askai.color, ['#7a3cff', '#00875a']),
                  color_dark: pickDifferent(brand.askai.color_dark, ['#b794ff', '#4fd1a5']),
                },
              },
            },
          };
        });
      });

      test('Clear a color with null to fall back to the preset or default', async () => {
        await expectWrite(session, () => ({ appearance: { brand: { link_color: '#123456' } } }));
        await expectWrite(session, () => ({ appearance: { brand: { link_color: null } } }));
      });

      test('Color values are stripped of CSS control characters', async () => {
        await expectWrite(session, () => ({ appearance: { brand: { link_color_dark: '#abcdef;}' } } }), {
          expected: { 'appearance.brand.link_color_dark': '#abcdef' },
        });
      });

      test('Set the corner radius', async () => {
        await expectWrite(session, project => ({
          appearance: { border_radius: pickDifferent(project.appearance.border_radius, ['pill', 'square']) },
        }));
      });
    });

    describe('Typography', () => {
      test('Choose heading, body, and code fonts', async () => {
        await expectWrite(session, project => {
          const { typography } = project.appearance;
          return {
            appearance: {
              typography: {
                heading_font: pickDifferent(typography.heading_font, ['Fraunces', 'Inter']),
                body_font: pickDifferent(typography.body_font, ['Lora', 'Inter']),
                code_font: pickDifferent(typography.code_font, ['JetBrains Mono', 'IBM Plex Mono']),
              },
            },
          };
        });
      });

      // Restoring a font URL cannot bring back an existing custom font's filename and format.
      function fontSkip(paths) {
        const planReason = planSkip(profile, 'stylesheet');
        if (planReason) return planReason;
        const filled = paths.filter(path => getPath(profile.project, path) !== null);
        if (filled.length === 0) return false;
        return `custom font already set at ${filled.join(', ')}`;
      }

      // The font endpoint writes straight to the project, so each slot is tracked before its upload.
      test('Upload a custom font', { skip: fontSkip([HEADING_FONT, BODY_FONT]) }, async t => {
        session.track([HEADING_FONT]);
        const heading = await uploadFont(t, session, 'heading');
        if (!heading) return;
        session.track([BODY_FONT]);
        const body = await uploadFont(t, session, 'body_regular');
        if (!body) return;

        const { typography } = (await session.current()).appearance;
        const stored = { filename: 'test-font.woff2', format: 'woff2' };
        assert.deepEqual(typography.custom_heading, { url: heading.url, ...stored });
        assert.deepEqual(typography.custom_body.regular, { url: body.url, ...stored });
      });

      test('Remove a custom font', { skip: fontSkip([HEADING_FONT]) }, async t => {
        session.track([HEADING_FONT]);
        const project = await session.current();
        if (project.appearance.typography.custom_heading.url === null) {
          const heading = await uploadFont(t, session, 'heading');
          if (!heading) return;
        }
        const { after: updated } = await expectWrite(session, () => ({
          appearance: { typography: { custom_heading: { url: null } } },
        }));
        assert.deepEqual(updated.appearance.typography.custom_heading, { url: null, filename: null, format: null });
      });

      test('Set text spacing', async () => {
        await expectWrite(session, project => ({
          appearance: {
            typography: { spacing: pickDifferent(project.appearance.typography.spacing, ['condensed', 'comfortable']) },
          },
        }));
      });
    });

    describe('Layout and header', () => {
      test('Choose the layout style', async () => {
        await expectWrite(session, project => ({
          appearance: { layout: { style: pickDifferent(project.appearance.layout.style, ['compact', 'classic']) } },
        }));
      });

      test('Turn full width and the sticky header on or off', async () => {
        await expectWrite(session, project => ({
          appearance: {
            layout: {
              full_width: pickDifferent(project.appearance.layout.full_width, ['enabled', 'disabled']),
              sticky_header: pickDifferent(project.appearance.layout.sticky_header, [true, false]),
            },
          },
        }));
      });

      test('Choose the header style', async () => {
        await expectWrite(session, project => ({
          appearance: { header: { type: pickDifferent(project.appearance.header.type, ['solid', 'line']) } },
        }));
      });

      test('Choose the header link style', async () => {
        await expectWrite(
          session,
          project => ({
            appearance: {
              header: { link_style: pickDifferent(project.appearance.header.link_style, ['pills', 'tabs']) },
            },
          }),
          { saved: usability },
        );
      });

      test('Align the header subnav', async () => {
        await expectWrite(session, project => ({
          appearance: {
            header: {
              subnav: { alignment: pickDifferent(project.appearance.header.subnav.alignment, ['start', 'center']) },
            },
          },
        }));
      });
    });

    describe('Header navigation', () => {
      test('Show or hide built-in sections', async () => {
        await expectWrite(
          session,
          project => {
            const { links } = project.appearance.navigation;
            return {
              appearance: {
                navigation: {
                  links: {
                    changelog: { visibility: pickDifferent(links.changelog.visibility, ['disabled', 'enabled']) },
                    home: { visibility: pickDifferent(links.home.visibility, ['enabled', 'disabled']) },
                  },
                },
              },
            };
          },
          { saved: usability },
        );
      });

      test('Show or hide Guides', async () => {
        await expectWrite(
          session,
          project => ({
            appearance: {
              navigation: {
                links: {
                  guides: {
                    visibility: pickDifferent(project.appearance.navigation.links.guides.visibility, [
                      'disabled',
                      'enabled',
                    ]),
                  },
                },
              },
            },
          }),
          { saved: hasPlanFeature(profile, 'guides') },
        );
      });

      test('Rename built-in sections', async () => {
        await expectWrite(
          session,
          project => ({
            appearance: {
              navigation: {
                links: {
                  reference: {
                    alias: pickDifferent(project.appearance.navigation.links.reference.alias, ['API Docs', 'Endpoint']),
                  },
                },
              },
            },
          }),
          { saved: usability },
        );
      });

      test('Edit header links', async () => {
        const link = { type: 'link_url', title: 'Skill test', url: 'https://example.com', custom_page: null };
        await expectWrite(
          session,
          project => ({
            appearance: {
              navigation: {
                right: [link, ...project.appearance.navigation.right.filter(item => item.title !== link.title)],
              },
            },
          }),
          { saved: usability },
        );
      });

      test('A custom_page header link without a slug is rejected', async t => {
        if (!usability) {
          t.skip('header links are gated on this plan, so the write is ignored before validation');
          return;
        }
        await expectRejected(session, {
          appearance: {
            navigation: { left: [{ type: 'custom_page', title: 'Missing', url: null, custom_page: null }] },
          },
        });
      });

      test('Choose the first page readers see', async () => {
        await expectWrite(session, project => ({
          appearance: {
            navigation: {
              first_page: pickDifferent(project.appearance.navigation.first_page, ['documentation', 'reference']),
            },
          },
        }));
      });

      test('Choose where the logo links', async () => {
        await expectWrite(
          session,
          project => ({
            appearance: {
              navigation: {
                logo_link: pickDifferent(project.appearance.navigation.logo_link, ['homepage', 'landing_page']),
              },
            },
          }),
          { saved: usability },
        );
      });

      test('Turn collapsible categories and breadcrumbs on or off', async () => {
        await expectWrite(session, project => {
          const { navigation } = project.appearance;
          return {
            appearance: {
              navigation: {
                collapsible_categories: pickDifferent(navigation.collapsible_categories, ['enabled', 'disabled']),
                breadcrumbs: pickDifferent(navigation.breadcrumbs, ['disabled', 'enabled']),
              },
            },
          };
        });
      });

      test('Turn page icons and the version picker on or off', async () => {
        await expectWrite(
          session,
          project => {
            const { navigation } = project.appearance;
            return {
              appearance: {
                navigation: {
                  page_icons: pickDifferent(navigation.page_icons, ['disabled', 'enabled']),
                  version: pickDifferent(navigation.version, ['enabled', 'disabled']),
                },
              },
            };
          },
          { saved: usability },
        );
      });

      test('Choose the subheader layout', async () => {
        await expectWrite(
          session,
          project => ({
            appearance: {
              navigation: {
                subheader_layout: pickDifferent(project.appearance.navigation.subheader_layout, ['dropdown', 'links']),
              },
            },
          }),
          { saved: usability },
        );
      });

      test('Choose the classic or unified search modal', async () => {
        await expectWrite(
          session,
          project => ({
            appearance: {
              navigation: {
                search_modal: pickDifferent(project.appearance.navigation.search_modal, ['classic', 'unified']),
              },
            },
          }),
          { saved: usability },
        );
      });
    });

    describe('Page display', () => {
      test('Turn the table of contents on or off', async () => {
        await expectWrite(
          session,
          project => ({
            appearance: {
              table_of_contents: pickDifferent(project.appearance.table_of_contents, ['disabled', 'enabled']),
            },
          }),
          { saved: usability },
        );
      });

      test('Choose the table of contents style', async () => {
        await expectWrite(session, project => ({
          appearance: { toc_variant: pickDifferent(project.appearance.toc_variant, ['dots', 'line']) },
        }));
      });

      test('Set the changelog layout, author, and date display', { skip: planSkip(profile, 'changelogs') }, async () => {
        await expectWrite(session, project => {
          const { changelog } = project.appearance;
          return {
            appearance: {
              changelog: {
                layout: pickDifferent(changelog.layout, ['collapsed', 'continuous']),
                show_author: !changelog.show_author,
                show_exact_date: !changelog.show_exact_date,
              },
            },
          };
        });
      });

      test('Choose the callout icon set', async () => {
        await expectWrite(session, project => ({
          appearance: {
            markdown: {
              callouts: {
                icon_font: pickDifferent(project.appearance.markdown.callouts.icon_font, ['fontawesome', 'emojis']),
              },
            },
          },
        }));
      });

      test('Rename the "What\'s Next" section', async () => {
        await expectWrite(
          session,
          project => ({
            appearance: {
              whats_next_label: pickDifferent(project.appearance.whats_next_label, ['Next steps', 'Read next']),
            },
          }),
          { saved: usability },
        );
      });

      test('Hide the ReadMe logo in the footer', async () => {
        await expectWrite(
          session,
          project => ({
            appearance: {
              footer: { readme_logo: pickDifferent(project.appearance.footer.readme_logo, ['hide', 'show']) },
            },
          }),
          { saved: hasPlanFeature(profile, 'whitelabel') },
        );
      });
    });

    describe('Landing page', () => {
      test('Edit the landing page hero', { skip: planSkip(profile, 'landing_page') }, async () => {
        await expectWrite(session, project => {
          const { promo } = project.appearance.landing_page;
          return {
            appearance: {
              landing_page: {
                promo: {
                  title: pickDifferent(promo.title, ['Skill test hero', 'Another hero']),
                  text: pickDifferent(promo.text, ['Skill test hero text', 'Another hero text']),
                  content_type: pickDifferent(promo.content_type, ['buttons', 'search']),
                  button_primary: pickDifferent(promo.button_primary, ['reference', 'docs']),
                  button_secondary: pickDifferent(promo.button_secondary, ['changelog', 'none']),
                },
              },
            },
          };
        });
      });

      test('Edit landing page sections', { skip: planSkip(profile, 'landing_page') }, async () => {
        const empty = {
          alignment: null,
          title: null,
          text: null,
          html: null,
          page_type: null,
          side: null,
          media_type: null,
          media_html: null,
          media_image: null,
          media_code: null,
          group0: null,
          group1: null,
          group2: null,
        };
        const sections = [
          { ...empty, type: 'text', alignment: 'center', title: 'Skill test', text: 'Section body' },
          {
            ...empty,
            type: 'text-media',
            title: 'With media',
            text: 'Media body',
            side: 'right',
            media_type: 'image',
            media_image: 'https://files.readme.io/45785f4-brandmark-blue.svg',
          },
          { ...empty, type: 'docs', page_type: 'Documentation' },
        ];
        await expectWrite(session, () => ({ appearance: { landing_page: { sections } } }));
      });
    });

    describe('Custom code', () => {
      test('Add custom CSS', async () => {
        await expectWrite(
          session,
          () => ({ appearance: { custom_code: { css: `/* skill test ${Date.now()} */ body { color: inherit; }` } } }),
          { saved: hasPlanFeature(profile, 'stylesheet') },
        );
      });

      test('Add custom JavaScript', async () => {
        await expectWrite(
          session,
          () => ({ appearance: { custom_code: { js: `// skill test ${Date.now()}` } } }),
          { saved: hasPlanFeature(profile, 'javascript') },
        );
      });

      test('Add custom HTML to the head and page footer', async () => {
        await expectWrite(
          session,
          () => ({
            appearance: {
              custom_code: {
                html: {
                  header: `<meta name="skill-test" content="${Date.now()}">`,
                  page_footer: `<!-- skill test ${Date.now()} -->`,
                },
              },
            },
          }),
          { saved: hasPlanFeature(profile, 'extra_html') },
        );
      });

      test('Add custom HTML to the home footer', async () => {
        await expectWrite(
          session,
          () => ({ appearance: { custom_code: { html: { home_footer: `<p>Skill test ${Date.now()}</p>` } } } }),
          { saved: hasPlanFeature(profile, 'whitelabel') },
        );
      });
    });
  });
}
