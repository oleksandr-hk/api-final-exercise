export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

//request to register a new user
export type RegisterUserRequest = {
  name?: string;
  email?: string;
  password?: string;
};

//created user response
export type RegisterUserResponse = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  isActive?: boolean;
};

//request to update user
export type UpdateUserRequest = {
  name?: string;
  email?: string;
  password?: string;
};

export type OauthTokenRequestData = {
  grant_type?: string;
  email?: string;
  password?: string;
};
