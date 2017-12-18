## Checking Dark Mode

Dark mode = True = On
Dark mode = False = Off
Dark mode = On = True
Dark mode = Off = False

| Dark Mode | Url   | Url Stem | Dark Mode | Result |
| ---       | ---   | ---      | ---       | ---    |
| On        | Undef | Undef    | On        | True   |
| On        | Undef | True     | On        | True   |
| On        | True  | True     | On        | True   |
| On        | True  | Undef    | On        | True   |
| On        | True  | False    | On        | True   |
| Off       | False | True     | Off       | False  |
| Off       | False | Undef    | Off       | False  |
| Off       | Undef | False    | Off       | False  |
| Off       | False | False    | Off       | False  |

## Building CSS

Build the content CSS (`dark-mode.css`) with:

```bash
gulp postcss
```

Build the pop up CSS (`dark-mode-popup.css`) with:

```bash
gulp less
```

And build all CSS with:

```bash
gulp
```

