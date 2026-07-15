// Custom credentials authentication service (Local persistence fallback)

export const initAuth = (onSuccess: any, onFailure: any) => {
  const isLoggedIn = localStorage.getItem("kembara_logged_in") === "true";
  if (isLoggedIn) {
    if (onSuccess) onSuccess({ email: "cm3105", displayName: "CM3105 Member" }, "local-session");
  } else {
    if (onFailure) onFailure();
  }
};

export const logout = async () => {
  localStorage.removeItem("kembara_logged_in");
};
