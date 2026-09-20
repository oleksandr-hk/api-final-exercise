export type Tag = {
  id: string;
  name?: string;
  slug?: string;
};

export type TagsResponse = Tag[];

export type CreateTagRequest = {
  name: string;
};

export type CreateTagResponse = {
  id: string,
  name: string;
  slug: string
};
