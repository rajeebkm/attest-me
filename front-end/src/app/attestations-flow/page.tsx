import AttestationsFlow from "~/AttestationsFlow/AttestationsFlow";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default async function Page() {
  return (
    <div className="">
      <Header/>
      <AttestationsFlow />
      <Footer/>
    </div>
  );
}