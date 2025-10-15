import React from "react";
import Diseno from "./Diseno";
import FormAgentes from "./FormAgentes";
import THEME from "./theme";

export default function Index({ user, rolUsuario }) {
  return <Diseno user={user} rolUsuario={rolUsuario} />;
}
