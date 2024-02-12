# Ticket Scanner - Backend

Este es el backend para la aplicación Ticket Scanner. Provee una API REST desarrollada con [NestJS](https://nestjs.com/).

## Descripción

El backend expone endpoints para:

- Autenticación y autorización de usuarios
- Manejo de datos escaneados desde tickets
- Generación de reportes y estadísticas

## Utiliza:

- Base de datos MongoDB
- JWT para manejo de sesiones
- Passport para autenticación
- TypeORM para el mapeo de entidades a la DB

## Instalación

```
$ npm install
```

## Ejecución

```
$ npm run start
```

Esto levanta el servidor en `http://localhost:3001`.

## Testing

```
$ npm run test
```

Ejecuta test unitarios con Jest.

## Deploy

El proyecto incluye configuración para desplegar en un contenedor Docker.

## Endpoints

### Autenticación

```
POST /auth/login
```

Inicia sesión y retorna un JWT token de acceso.

Parámetros:

- `email`: Correo del usuario
- `password`: Contraseña

Ejemplo:

```json
{
  "email": "john@email.com",
  "password": "1234"
}
```

### Verifica tu acceso

```
GET /profile
```

Retorna los datos del usuario autenticado.

Requiere JWT token en Authorization header.

### Registro de usuario

```
POST /auth/register
```

Crea una nueva cuenta de usuario.

Parámetros:

- `name`: Nombre del usuario
- `email`: Email (debe ser único)
- `password`: Contraseña

Ejemplo:

```json
{
  "name": "John Doe",
  "email": "john@email.com",
  "password": "1234"
}
```

### Interfaces y objetos

#### Ticket

```
Supermarket = 'DISCO' | 'JUMBO' | 'EASY'

TicketItem {

  name: string;

  quantity: number;

  price: number;

  total: number;

}

Discounts {

  desc_items: { desc_name: string, desc_amount: number }[];

  disc_total: number;

}

Ticket {

  logoLink: string;

  totalAmount: number;

  ticketItems: TicketItem[];

  address: string;

  date: string;

  discounts: Discounts;

  paymentMethod: string;

  og_ticket_url: string;

  supermarket: Supermarket;

  user?: string;

}
```

#### Usuario

```
User {

  id: string;

  email: string;

  name: string;

  password: string;

  image?: string;

}
```

#### Item (resultado de la búsqueda de items)

```
ItemsSearchResult {

  name: string;

  quantity: number;

  price: number;

  total: number;

  logoLink: string;

  date: string;

  og_ticket_url: string;

  supermarket: Supermarket;

  ticketId: string;

}

```

### Escaneo de tickets

```
POST /tickets
```

Crea un nuevo ticket escaneado.

Parámetros:

- `rawTicketHTML`: Texto HTML de la factura escaneada, el HTML debe ser solicitado en el cliente y enviado al servidor
- `supermarket`: Nombre del supermercado en mayúsculas, actualmente se soporta "DISCO", "JUMBO" y "EASY"
- `og_ticket_url`: URL de la factura digital.

Devuelve un objeto "Ticket" sin "user"

```
POST /tickets/save
```

Parámetros:

- `rawTicketHTML`: Texto HTML de la factura escaneada, el HTML debe ser solicitado en el cliente y enviado al servidor
- `supermarket`: Nombre del supermercado en mayúsculas, actualmente se soporta "DISCO", "JUMBO" y "EASY"
- `og_ticket_url`: URL de la factura digital.
- `user`: Email del usuario

Crea y guarda un nuevo ticket escaneado asociado al usuario autenticado.

Requiere JWT token en Authorization header.

### Obtener tickets

```
GET /tickets
```

Obtiene todos los tickets guardados del usuario autenticado.

Requiere JWT token en Authorization header.

```
GET /tickets/:id
```

Obtiene un ticket por su ID, debe pertenecer al usuario autenticado.

Requiere JWT token en Authorization header.

### Eliminar ticket

```
DELETE /tickets/:id
```

Elimina un ticket por su ID, debe pertenecer al usuario autenticado.

Requiere JWT token en Authorization header.

### Búsqueda de productos

```
GET /items?term=:keyword
```

Busca productos en base a keyword, entre los tickets del usuario autenticado.

Requiere JWT token en Authorization header.

---

## Contribuciones

Pull requests son bienvenidos. Para cambios mayores abrir un issue primero para discutir qué modificaciones realizar.

Por consultas o issues contactar a simosa37@gmail.com
