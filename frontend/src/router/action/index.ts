// import { authApi } from "../../api";
import api, { authApi } from "@/api";
import { AxiosError } from "axios";
import { redirect, type ActionFunctionArgs } from "react-router-dom";
import { queryClient } from "@/api/query";

export const loginAction = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const credentials = Object.fromEntries(formData);
  try {
    await authApi.post("login", credentials);
    const redirectTo = new URL(request.url).searchParams.get("redirect") || "/";
    return redirect(redirectTo);
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response) {
        return { error: error.response.data.message };
      }
    }
  }
};
export const registerAction = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const credentials = Object.fromEntries(formData);

  try {
    await authApi.post("register", credentials);

    return redirect("/login");
  } catch (error) {
    if (error instanceof AxiosError) {
      return { error: error.response?.data?.message || "Registration failed" };
    }

    return { error: "Something went wrong" };
  }
};

export const logoutAction = async () => {
  try {
    await api.post("logout");
    return redirect("/login");
  } catch (error) {
    console.error("logout failed!", error);
  }
};

export const favouriteAction = async ({
  request,
  params,
}: ActionFunctionArgs) => {
  const formData = await request.formData();
  if (!params.productId) {
    throw new Error("No Product ID provided");
  }

  const data = {
    productId: Number(params.productId),
    favourite: formData.get("favourite") === "true", // true
  };

  try {
    await api.patch("users/products/toggle-favourite", data);

    await queryClient.invalidateQueries({
      queryKey: ["products", "detail", params.productId],
    });

    return null;
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response) {
        return { error: error.response.data.message };
      }
    }
  }
};
export const resetAction = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const credentials = Object.fromEntries(formData);

  try {
    await authApi.post("forget-password", credentials);

    return {
      success: "Password reset link sent to your email",
    };
  } catch (error) {
    if (error instanceof AxiosError) {
      return { error: error.response?.data?.message };
    }

    return { error: "Something went wrong" };
  }
};

export const newPasswordAction = async ({
  request,
  params,
}: ActionFunctionArgs) => {
  const formData = await request.formData();

  const password = formData.get("password");

  try {
    await authApi.post("reset-password", {
      token: params.token,
      password,
    });

    return redirect("/login");
  } catch (error) {
    if (error instanceof AxiosError) {
      return { error: error.response?.data?.message };
    }
  }
};
