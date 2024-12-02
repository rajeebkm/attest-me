import Header from "../components/Header";
import Footer from "../components/Footer";
import AttestationsView from "~/AttestationsView/AttestationsView";

export default async function Page() {
  return (
    <div className=" ">
      <Header/>
      <AttestationsView />
      <Footer/>
    </div>
  );
}