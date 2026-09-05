// datos del juego
// las respuestas son: "IaaS", "PaaS", "SaaS", "Nube pública", "Nube privada", "Nube híbrida"
// type: "normal", "virus" (resta 3s), "overclock" (suma 5s)

const cloudCases = [
    {
        caso: "La empresa alquila servidores virtuales, almacenamiento y redes en la nube, pero ellos instalan y configuran el sistema operativo, las bases de datos y la aplicación.",
        respuesta: "IaaS", // Infrastructure as a Service
        type: "normal"
    },
    {
        caso: "Un equipo de desarrolladores sube el código de su aplicación web a un entorno preconfigurado que automáticamente escala y gestiona los servidores subyacentes sin que el equipo deba preocuparse por el hardware.",
        respuesta: "PaaS", // Platform as a Service
        type: "normal"
    },
    {
        caso: "Los empleados utilizan Google Workspace o Microsoft 365 directamente desde su navegador web sin necesidad de instalar, mantener o actualizar ningún software en sus computadoras.",
        respuesta: "SaaS", // Software as a Service
        type: "normal"
    },
    {
        caso: "Una startup utiliza los servicios de Amazon Web Services (AWS) que están disponibles para cualquier usuario a través de Internet para alojar su aplicación y bases de datos.",
        respuesta: "Nube pública",
        type: "normal"
    },
    {
        caso: "Un banco instala su propio centro de datos exclusivo, controlado y administrado únicamente por su equipo de TI, para mantener la máxima seguridad de datos financieros sensibles.",
        respuesta: "Nube privada",
        type: "normal"
    },
    {
        caso: "Un hospital mantiene los datos confidenciales de los pacientes en sus servidores locales exclusivos, pero utiliza un servicio en la nube externa para ejecutar análisis de datos anónimos con alto poder de cómputo.",
        respuesta: "Nube híbrida",
        type: "normal"
    },
    {
        caso: "Netflix utiliza los servidores y el almacenamiento de AWS para guardar su inmenso catálogo de películas y transmitirlo a usuarios en todo el mundo de forma elástica.",
        respuesta: "IaaS",
        type: "normal"
    },
    {
        caso: "Utilizas un servicio como Heroku o Vercel donde solo te preocupas de escribir código (Node.js, Python, React) y la plataforma se encarga de todo el hosting y base de datos.",
        respuesta: "PaaS",
        type: "normal"
    },
    {
        caso: "El equipo de marketing usa Salesforce, una plataforma web para gestionar clientes (CRM) que se cobra por suscripción mensual por usuario activo.",
        respuesta: "SaaS",
        type: "normal"
    },
    {
        caso: "El gobierno decide construir una infraestructura en la nube dedicada solo para entidades gubernamentales, aislada físicamente del resto del mundo.",
        respuesta: "Nube privada",
        type: "normal"
    },
    {
        caso: "Una tienda online usa sus propios servidores la mayor parte del año, pero durante el Black Friday (cuando el tráfico colapsa su servidor), desborda automáticamente el tráfico excedente a Microsoft Azure.",
        respuesta: "Nube híbrida",
        type: "normal"
    },
    {
        caso: "Cualquier persona o empresa en el mundo puede registrarse y acceder a recursos informáticos compartidos operados por un proveedor a través de Internet.",
        respuesta: "Nube pública",
        type: "normal"
    },
    {
        caso: "Dropbox o Google Drive, donde pagas por espacio de almacenamiento y lo usas directamente sin configurar ningún servidor.",
        respuesta: "SaaS",
        type: "normal"
    },
    {
        caso: "Una empresa utiliza contenedores Docker, pero contrata un servicio en la nube (como Google Kubernetes Engine) que le administra el software de los contenedores automáticamente.",
        respuesta: "PaaS",
        type: "normal"
    },
    {
        caso: "Un proveedor de nube te da acceso a hardware desnudo (Bare Metal) y tú tienes que instalarle desde el sistema operativo hasta el antivirus.",
        respuesta: "IaaS",
        type: "normal"
    },
    // tarjetas virus
    {
        caso: "⚠️ ALERTA: Un ransomware ha cifrado los datos del servidor en la nube pública. El equipo de TI debe actuar rápido para contener el ataque antes de que se propague.",
        respuesta: "Nube pública",
        type: "virus"
    },
    {
        caso: "⚠️ ALERTA: Se detectó un acceso no autorizado a la plataforma SaaS de la empresa. Un hacker está intentando robar las credenciales de los usuarios a través de phishing.",
        respuesta: "SaaS",
        type: "virus"
    },
    {
        caso: "⚠️ ALERTA: Un ataque DDoS masivo está colapsando los servidores IaaS. El proveedor necesita activar medidas de mitigación de emergencia.",
        respuesta: "IaaS",
        type: "virus"
    },
    {
        caso: "⚡ BOOST: La empresa activa el auto-escalado automático en su infraestructura IaaS, duplicando la capacidad de cómputo instantáneamente para manejar el pico de tráfico navideño.",
        respuesta: "IaaS",
        type: "overclock"
    },
    {
        caso: "⚡ BOOST: El equipo de desarrollo despliega su aplicación en una plataforma PaaS con CI/CD integrado, reduciendo el tiempo de despliegue de horas a minutos.",
        respuesta: "PaaS",
        type: "overclock"
    },
    {
        caso: "⚡ BOOST: La empresa migra toda su comunicación a un SaaS colaborativo, aumentando la productividad del equipo remoto en un 40%.",
        respuesta: "SaaS",
        type: "overclock"
    },
    // golden freddy easter egg
    {
        caso: "🐻 GOLDEN FREDDY: Un misterioso servicio en la nube aparece sin previo aviso. Parece una infraestructura fantasma que ofrece máquinas virtuales ilimitadas... pero solo existe por unos segundos. ¿Es IaaS o solo una alucinación?",
        respuesta: "IaaS",
        type: "golden"
    },
    // creeper jaja
    {
        caso: "<img src='creeper-icon.png' alt='Creeper' style='width: 22px; height: 22px; vertical-align: middle; image-rendering: pixelated; border-radius: 2px;'> Awww man... este servicio en la nube se ve verde y se acerca peligrosamente a tu base de datos. ¡Rápido, ponlo en un servidor aislado o explotará toda la empresa! (Pista: Infraestructura)",
        respuesta: "IaaS",
        type: "creeper"
    }
];
