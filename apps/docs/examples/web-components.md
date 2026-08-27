---
title: Web Components Example
description: Framework-agnostic usage with the page-flip-book custom element
---

# Web Components Example

```html
<script type="module">
  import '@pageflip/web-component';
  import '@pageflip/theme';
</script>

<page-flip-book width="800" height="600" size="stretch" show-cover>
  <div slot="pages">
    <div slot="page-0">Cover</div>
    <div slot="page-1">Page 1</div>
    <div slot="page-2">Page 2</div>
    <div slot="page-3">Back cover</div>
  </div>

  <page-flip-toolbar slot="toolbar" position="bottom"></page-flip-toolbar>
</page-flip-book>
```

## JavaScript control

```js
const book = document.querySelector('page-flip-book');

book.addEventListener('flip', (event) => {
  console.log(event.detail.pageIndex);
});

await book.flipNext();
```
