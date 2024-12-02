import Header from "../components/Header";
import Footer from "../components/Footer";
import CreateSchemas from "../components/CreateSchemas/CreateSchemas";

export default async function Page() {
  return (
    <div className="">
      <Header />
      <CreateSchemas />
      <Footer />
    </div>
  );
}