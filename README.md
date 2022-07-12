# HTML BOILERPLATE

## Requirements

- Node.js
- yarn

## Usage

### Development

```shell
$ yarn start
```

### Production build

```shell
$ yarn build
```

## Resolving path

The following default values can be changed by editing `config. directory` in `package.json`

### Typescript

```typescript
import foo as bar from '@/baz';
```

Default resolved path: `assets/js` \*`@` is the alias of the resolved path

#### CSS

```css
.foo {
  background-image: url(assets/images/foo.jpg);
}
```

### Images

#### default

```pug
img(src=require("assets/images/foo.jpg"))
```

##### data-uri

```pug
img(src=require("path/to/file.jpg?inline"))
```

##### raw (for svg)

```pug
img(src=require("path/to/file.svg?include")
```

##### webp

```pug
img(src=require("path/to/file.jpg?as=webp"))
```

##### avif

```pug
img(src=require("path/to/file.jpg?as=avif"))
```
