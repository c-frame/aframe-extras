# Primitives

Reusable entities / primitives.

- `<a-grid/>`: Flat grid, with subdivisions at regular intervals.
- `<a-ocean/>`: Ocean with animated waves.
- `<a-tube/>`: Tube following a custom path.

## Usage

Basic:

```html
<a-grid></a-grid>

<a-ocean></a-ocean>

<a-tube path="5 0 5, 5 0 -5, -5 0 -5" radius="0.5" material="color: red"></a-tube>

```

Custom:

```html
<a-grid src="custom-image.png"></a-grid>
```

```html
<a-ocean color="#92E2E2" width="25" depth="25" density="15" speed="2"></a-ocean>
```
