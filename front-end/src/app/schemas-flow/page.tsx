import SchemasFlow from "~/SchemasFlow/SchemasFlow";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SchemasTable from "../components/CreateSchemas/CreateSchemas";

export default async function Page() {
  return (
    <div className="">
      <Header />
      <SchemasFlow />
      <Footer />
    </div>
  );
}