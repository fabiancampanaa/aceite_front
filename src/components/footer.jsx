
//npm install @fortawesome/fontawesome-free
//import "@fortawesome/fontawesome-free/css/all.min.css";

function Footer() {
        return (
            <footer className="footer has-background-dark has-text-white">
              <div className="container">
                <div className="columns is-vcentered">
                  {/* Redes Sociales */}
                  <div className="column has-text-centered">
                    <a href="https://www.instagram.com" className="icon has-text-white mx-3" target="_blank" rel="noopener noreferrer">
                      <i className="fab fa-instagram fa-lg"></i>
                    </a>
                    <a href="https://www.facebook.com" className="icon has-text-white mx-3" target="_blank" rel="noopener noreferrer">
                      <i className="fab fa-facebook fa-lg"></i>
                    </a>
                  </div>
        
                  {/* Dirección */}
                  <div className="column has-text-centered">
                    <p>
                      <i className="fas fa-map-marker-alt"></i> Valle del Huasco
                    </p>
                  </div>
                </div>
              </div>
            </footer>
          ); 
  }
  
  export default Footer;
  