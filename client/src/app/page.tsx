import { redirect } from "next/navigation";
import React from "react";

export const page = () => {
  redirect("/dashboard");
};
