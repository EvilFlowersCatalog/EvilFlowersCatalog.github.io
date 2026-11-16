import MDXComponents from '@theme-original/MDXComponents';
import Img from '@site/src/components/Figure/Img';
import Figure, {Figures} from '@site/src/components/Figure';
import Diagram from '@site/src/components/Diagram';

// Available in every .md/.mdx file without an import.
export default {
  ...MDXComponents,
  img: Img,
  Figure,
  Figures,
  Diagram,
};
