# Contrast Grid Editor

_This entire site was built entirely by `claude-3.5-sonnet1`_

A modern, interactive web application for testing color contrast ratios between different combinations of colors. Built with React, TypeScript, and Tailwind CSS, this tool helps designers and developers ensure their color choices meet WCAG accessibility standards.

## Features

- **Interactive Color Grid**: Visualize contrast ratios between foreground and background colors in a dynamic grid format
- **Real-time Contrast Calculation**: Instantly see contrast ratios and WCAG compliance levels (AAA, AA, or failing)
- **Color Picker**:
  - Advanced color picker with HSL and RGB modes
  - Visual color preview
  - Real-time hex, RGB, and HSL value display
  - Click any color swatch to edit

- **Color Management**:
  - Add multiple colors for testing
  - Label colors for better organization
  - Drag and drop to reorder colors
  - "Random Colors" button to generate random color combinations
  - "Clear All" button to reset to a basic black and white grid

- **Accessibility Features**:
  - Clear visual indicators for passing/failing contrast ratios
  - AAA (7.0+) and AA (4.5+) compliance indicators
  - Dark mode support

## Usage

1. **Adding Colors**:
   - Enter colors in the text areas (one per line)
   - Use hex codes, RGB, or HSL values
   - Optionally add labels using comma (e.g., "#FF0000, Red Button")

2. **Editing Colors**:
   - Click any color swatch to open the color picker
   - Use HSL or RGB sliders to adjust colors
   - View real-time updates to contrast ratios

3. **Grid Navigation**:
   - Drag column headers to reorder foreground colors
   - Drag row headers to reorder background colors
   - Scroll horizontally for large color sets

4. **Quick Actions**:
   - Use "Random Colors" to generate a random color combination
   - Use "Clear All" to reset to a basic black/white grid

## Contrast Ratio Legend

- **AAA (Enhanced)**: Contrast ratio ≥ 7.0
- **AA (Standard)**: Contrast ratio ≥ 4.5
- **Failed**: Contrast ratio < 4.5

## Technical Details

- Built with React and TypeScript
- Styled with Tailwind CSS
- Uses Chroma.js for color manipulation and contrast calculations
- Supports dark mode with system preference detection
- Persists color data in localStorage

## Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## License

MIT License