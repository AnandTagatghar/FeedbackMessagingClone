import { brand_name } from "@/utils/constants";
import React from "react";

const Footer = () => {
  return (
    <div className="w-full py-5  bg-cardColor">
      <p className=" text-center text-secondaryText text-lg">&copy; { brand_name} All rights reserved</p> 
    </div>
  );
};

export default Footer;
