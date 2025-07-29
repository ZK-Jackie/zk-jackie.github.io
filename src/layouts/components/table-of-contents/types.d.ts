export type Heading = {
  subheadings: Heading[];
  depth: number;
  slug: string;
  text: string;
};