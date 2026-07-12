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
