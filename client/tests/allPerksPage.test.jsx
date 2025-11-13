// client/tests/allPerksPage.test.jsx

import { fireEvent, screen, waitFor } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';

import AllPerks from '../src/pages/AllPerks.jsx';
import { renderWithRouter } from './utils/renderWithRouter.js';

describe('AllPerks page (Directory)', () => {
  test('lists public perks and responds to name filtering', async () => {
    // The seeded record gives us a deterministic expectation regardless of the
    // rest of the shared database contents.
    const seededPerk = global.__TEST_CONTEXT__.seededPerk;

    // Render the exploration page so it performs its real HTTP fetch.
    renderWithRouter(
      <Routes>
        <Route path="/explore" element={<AllPerks />} />
      </Routes>,
      { initialEntries: ['/explore'] }
    );

    // Wait for the baseline card to appear which guarantees the asynchronous fetch finished.
    await waitFor(() => {
      expect(screen.getByText(seededPerk.title)).toBeInTheDocument();
    });

    // Interact with the name filter input using the seeded record's title.
    const nameFilter = screen.getByPlaceholderText('Enter perk name...');
    fireEvent.change(nameFilter, { target: { value: seededPerk.title } });

    // Wait for filtering to complete and the seeded perk to still be visible.
    await waitFor(() => {
      expect(screen.getByText(seededPerk.title)).toBeInTheDocument();
    });

    // The summary text should continue to reflect the number of matching perks.
    expect(screen.getByText(/showing/i)).toHaveTextContent('Showing');
  });

  test('lists public perks and responds to merchant filtering', async () => {
    // Again, use the seeded record for a consistent result.
    const seededPerk = global.__TEST_CONTEXT__.seededPerk;

    renderWithRouter(
      <Routes>
        <Route path="/explore" element={<AllPerks />} />
      </Routes>,
      { initialEntries: ['/explore'] }
    );

    // Wait until the seeded perk is displayed.
    await waitFor(() => {
      expect(screen.getByText(seededPerk.title)).toBeInTheDocument();
    });

    // Find the merchant filter dropdown and wait until it’s populated.
    let merchantFilter;
    await waitFor(() => {
      const label = screen.getByText(/filter by merchant/i);
      const container = label.closest('div');
      merchantFilter = container?.querySelector('select');
      expect(merchantFilter).toBeTruthy();

      // Verify that the seeded merchant exists as an option.
      const options = Array.from(merchantFilter.options).map(opt => opt.value);
      expect(options).toContain(seededPerk.merchant);
    });

    // Change the dropdown value to the seeded merchant.
    fireEvent.change(merchantFilter, { target: { value: seededPerk.merchant } });

    // Wait for the filter to apply (the component may debounce updates).
    await waitFor(
      () => {
        expect(screen.getByText(seededPerk.title)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Summary text should still reflect correct matching count.
    expect(screen.getByText(/showing/i)).toHaveTextContent('Showing');
  });
});
