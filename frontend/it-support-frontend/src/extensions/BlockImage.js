import { ResizableImage } from 'tiptap-extension-resizable-image';

const BlockImage = ResizableImage.extend({
  name: 'imageComponent',
  inline: false,          // теперь TipTap НЕ оборачивает картинку в <p>
  group: 'block',         // полноценная блочная нода
});

export default BlockImage;
