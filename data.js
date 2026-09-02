// data.js
// Puedes agregar más casos copiando y pegando un bloque { caso: "...", respuesta: "..." }
// Asegúrate de que la 'respuesta' coincida exactamente con una de estas categorías: 
// "IaaS", "PaaS", "SaaS", "Nube pública", "Nube privada", "Nube híbrida"

const cloudCases = [
    {
        caso: "La empresa alquila servidores virtuales, almacenamiento y redes en la nube, pero ellos instalan y configuran el sistema operativo, las bases de datos y la aplicación.",
        respuesta: "IaaS" // Infrastructure as a Service
    },
    {
        caso: "Un equipo de desarrolladores sube el código de su aplicación web a un entorno preconfigurado que automáticamente escala y gestiona los servidores subyacentes sin que el equipo deba preocuparse por el hardware.",
        respuesta: "PaaS" // Platform as a Service
    },
    {
        caso: "Los empleados utilizan Google Workspace o Microsoft 365 directamente desde su navegador web sin necesidad de instalar, mantener o actualizar ningún software en sus computadoras.",
        respuesta: "SaaS" // Software as a Service
    },
    {
        caso: "Una startup utiliza los servicios de Amazon Web Services (AWS) que están disponibles para cualquier usuario a través de Internet para alojar su aplicación y bases de datos.",
        respuesta: "Nube pública"
    },
    {
        caso: "Un banco instala su propio centro de datos exclusivo, controlado y administrado únicamente por su equipo de TI, para mantener la máxima seguridad de datos financieros sensibles.",
        respuesta: "Nube privada"
    },
    {
        caso: "Un hospital mantiene los datos confidenciales de los pacientes en sus servidores locales exclusivos, pero utiliza un servicio en la nube externa para ejecutar análisis de datos anónimos con alto poder de cómputo.",
        respuesta: "Nube híbrida"
    },
    {
        caso: "Netflix utiliza los servidores y el almacenamiento de AWS para guardar su inmenso catálogo de películas y transmitirlo a usuarios en todo el mundo de forma elástica.",
        respuesta: "IaaS"
    },
    {
        caso: "Utilizas un servicio como Heroku o Vercel donde solo te preocupas de escribir código (Node.js, Python, React) y la plataforma se encarga de todo el hosting y base de datos.",
        respuesta: "PaaS"
    },
    {
        caso: "El equipo de marketing usa Salesforce, una plataforma web para gestionar clientes (CRM) que se cobra por suscripción mensual por usuario activo.",
        respuesta: "SaaS"
    },
    {
        caso: "El gobierno decide construir una infraestructura en la nube dedicada solo para entidades gubernamentales, aislada físicamente del resto del mundo.",
        respuesta: "Nube privada"
    },
    {
        caso: "Una tienda online usa sus propios servidores la mayor parte del año, pero durante el Black Friday (cuando el tráfico colapsa su servidor), desborda automáticamente el tráfico excedente a Microsoft Azure.",
        respuesta: "Nube híbrida"
    },
    {
        caso: "Cualquier persona o empresa en el mundo puede registrarse y acceder a recursos informáticos compartidos operados por un proveedor a través de Internet.",
        respuesta: "Nube pública"
    },
    {
        caso: "Dropbox o Google Drive, donde pagas por espacio de almacenamiento y lo usas directamente sin configurar ningún servidor.",
        respuesta: "SaaS"
    },
    {
        caso: "Una empresa utiliza contenedores Docker, pero contrata un servicio en la nube (como Google Kubernetes Engine) que le administra el software de los contenedores automáticamente.",
        respuesta: "PaaS"
    },
    {
        caso: "Un proveedor de nube te da acceso a hardware desnudo (Bare Metal) y tú tienes que instalarle desde el sistema operativo hasta el antivirus.",
        respuesta: "IaaS"
    }
];
