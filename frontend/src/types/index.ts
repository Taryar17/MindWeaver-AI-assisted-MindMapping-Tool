export interface NavItem {
  title: string;
  href?: string;
  description?: string;
}

export interface NavItemWithChildren extends NavItem {
  card?: NavItemWithChildren[];
  menu?: NavItemWithChildren[];
}

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  avatar: string;
  role: string;
  createdAt: Date;
};

export interface CurrentUser {
  id: number;
  firstName?: string;
  lastName?: string;
  phone: string;
  email?: string;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "INACTIVE" | "FREEZE";
  image?: string;
  lastLogin?: string;
}
export interface MindMapSummary {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  _count: {
    nodes: number;
    edges: number;
  };
}

// For the preview thumbnail, we can generate a simple representation
export interface MindMapPreview extends MindMapSummary {
  thumbnail?: string; // We could generate this from nodes data
  nodeCount: number;
  edgeCount: number;
}
export type MainNavItem = NavItemWithChildren;
