export type PrismicRichText = any;

export type News = {
  _meta?: {
    uid?: string;
  }
  title?: PrismicRichText;
  date?: string;
  content?: PrismicRichText;
  authors: any/* Array<{
    author: Person;
  }> */
};
