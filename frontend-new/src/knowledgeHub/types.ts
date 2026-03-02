export interface DocumentFrontmatter {
  title: string;
  description: string;
  sector?: string;
  icon?: string;
}

export interface DocumentMetadata extends DocumentFrontmatter {
  id: string;
}

export interface Document extends DocumentMetadata {
  content: string;
}
