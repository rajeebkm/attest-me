import Header from "../components/Header";
import Footer from "../components/Footer";
import MakeAttestations from "../components/MakeAttestations/MakeAttestations";

export default async function Page() {
  return (
    <div className=" ">
      <Header/>
      <MakeAttestations />
      <Footer/>
    </div>
  );
}