export type TRegisterUser = {
  name: string;
  email: string;
  password: string;
  role: "CUSTOMER" | "PROVIDER";
  profileImage?: string;
};

export type TLoginUser = {
  email: string;
  password: string;
};

export type TUpdateProfile = {
  name?: string;
  profileImage?: string;
};

export type TChangePassword = {
  oldPassword: string;
  newPassword: string;
};
