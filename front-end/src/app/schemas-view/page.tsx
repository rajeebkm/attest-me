import Header from "../components/Header";
import Footer from "../components/Footer";
import SchemasView from "~/SchemasView/SchemasView";

export default async function Page() {
  return (
    <div className="">
      <Header/>
      <SchemasView />
      <Footer/>
    </div> 
  );
}