import "./App.css";
import "bulma/css/bulma.min.css";
import Inicio from "./components/inicio";
import Cabecera from "./components/cabecera";
import Footer from "./components/footer";

function App() {
  return (
    <>
      <div className="hero is-fullheight">
        <Cabecera />
        <Inicio />
        <Footer />
      </div>
    </>
  );
}

export default App;
