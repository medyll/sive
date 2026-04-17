<!-- 9-layout-semantic-interface-description.md -->

## 9. Layout — Semantic Interface Description

When a new interface element is needed, follow this workflow:

1. **Define in `sive-layout`**: Add the new element to the `sive-layout.html` file.
2. **Generate Mockups**: Run the command `pnpm run gen:mockups` to generate mockup components in `lib/elements/mockups`.
3. **Use Mockups as Reference**: The generated mockups serve as the reference for Svelte 5 components and the component model for Sive.
4. **Create Components**: Place the new components in `lib/elements` based on the mockup structure.

### Command Details

- **Command**: `pnpm run gen:mockups`
- **Description**: Generates mockup components from `sive-layout.html` into `lib/elements/mockups`.
- **Purpose**: Ensures consistency and adherence to Svelte 5 standards for new components.