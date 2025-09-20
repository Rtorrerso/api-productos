**Ejercicio práctico Unidad 3**

**Session 1**

**Paso 0 --- Requisitos rápidos**

1.  **Node.js** 18 o superior

2.  **npm** (v9+).

3.  **VS Code** (recomendado).

4.  En Windows, si nest "no se reconoce", agrega a tu PATH:\
    C:\\Users\\\<TU_USUARIO\>\\AppData\\Roaming\\npm

Comprueba versiones:

node -v

npm -v

**Paso 1 --- Instalar el CLI de Nest**

npm i -g \@nestjs/cli

-   **¿Qué hace?** Instala globalmente la herramienta nest para
    scaffolding (crear proyectos, módulos, controladores, servicios) y
    utilidades de desarrollo.

Verifica:

nest \--version

**Paso 2 --- Crear un proyecto base**

nest new api-productos

-   **¿Qué hace?** Crea una carpeta api-productos con estructura lista
    (TypeScript, tsconfig, scripts npm, etc.).

-   Te preguntará el **gestor de paquetes** (npm, pnpm o yarn). Puedes
    elegir **npm** sin problema.

Estructura mínima que verás:

src/

app.controller.ts

app.module.ts

main.ts

**Paso 3 --- Entrar al proyecto y correr en modo dev**

cd api-productos

npm run start:dev

-   **¿Qué hace?** Levanta el servidor en modo "watch" (recarga al
    guardar).

-   Abre:
    [**[http://localhost:3000]{.underline}**](http://localhost:3000) →
    verás "Hello World!".

Si el puerto 3000 está ocupado, puedes cambiar el puerto en main.ts:

await app.listen(4000);

**Siguiente meta: construir tu API de Productos (CRUD) 📦**

Haremos lo esencial: **módulo, servicio, controlador, DTOs con
validación y Swagger**. Todo en memoria (sin base de datos) para
aprender los fundamentos.

**4.1 Generar recurso (opción rápida con schematics)**

Si quieres hacerlo "automágico":

nest g resource products \--no-spec

-   Elige: **REST API**, **CRUD**, **Yes** a Swagger si lo pregunta.\
    Esto te crea módulo, servicio, controlador y DTOs.\
    **Pasa al Paso 5 (Validación global) y 6 (Swagger)** para afinar.

**4.2 Hacerlo manual (opción didáctica)**

Si prefieres entender cada pieza, usa:

nest g module products

nest g controller products \--no-spec

nest g service products \--no-spec

Crea src/products/entities/product.entity.ts:

export class Product {

id: number;

name: string;

price: number;

description?: string;

}

Crea src/products/dto/create-product.dto.ts:

import { IsString, IsNumber, IsPositive, IsOptional } from
\'class-validator\';

import { ApiProperty } from \'@nestjs/swagger\';

export class CreateProductDto {

\@ApiProperty({ example: \'Café latte\' })

\@IsString()

name: string;

\@ApiProperty({ example: 3.5 })

\@IsNumber()

\@IsPositive()

price: number;

\@ApiProperty({ example: \'Bebida caliente\', required: false })

\@IsOptional()

\@IsString()

description?: string;

}

Crea src/products/dto/update-product.dto.ts:

import { PartialType } from \'@nestjs/swagger\';

import { CreateProductDto } from \'./create-product.dto\';

export class UpdateProductDto extends PartialType(CreateProductDto) {}

Edita src/products/products.service.ts:

import { Injectable, NotFoundException } from \'@nestjs/common\';

import { Product } from \'./entities/product.entity\';

import { CreateProductDto } from \'./dto/create-product.dto\';

import { UpdateProductDto } from \'./dto/update-product.dto\';

\@Injectable()

export class ProductsService {

private products: Product\[\] = \[\];

private idSeq = 1;

create(dto: CreateProductDto): Product {

const product: Product = { id: this.idSeq++, \...dto };

this.products.push(product);

return product;

}

findAll(): Product\[\] {

return this.products;

}

findOne(id: number): Product {

const prod = this.products.find(p =\> p.id === id);

if (!prod) throw new NotFoundException(\`Producto \${id} no
encontrado\`);

return prod;

}

update(id: number, dto: UpdateProductDto): Product {

const prod = this.findOne(id);

const updated = { \...prod, \...dto };

this.products = this.products.map(p =\> (p.id === id ? updated : p));

return updated;

}

remove(id: number): void {

this.findOne(id); // valida existencia

this.products = this.products.filter(p =\> p.id !== id);

}

}

Edita src/products/products.controller.ts:

import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe
} from \'@nestjs/common\';

import { ProductsService } from \'./products.service\';

import { CreateProductDto } from \'./dto/create-product.dto\';

import { UpdateProductDto } from \'./dto/update-product.dto\';

import { ApiTags, ApiCreatedResponse, ApiOkResponse } from
\'@nestjs/swagger\';

\@ApiTags(\'products\')

\@Controller(\'products\')

export class ProductsController {

constructor(private readonly productsService: ProductsService) {}

\@Post()

\@ApiCreatedResponse({ description: \'Producto creado\' })

create(@Body() dto: CreateProductDto) {

return this.productsService.create(dto);

}

\@Get()

\@ApiOkResponse({ description: \'Lista de productos\' })

findAll() {

return this.productsService.findAll();

}

\@Get(\':id\')

\@ApiOkResponse({ description: \'Detalle de producto\' })

findOne(@Param(\'id\', ParseIntPipe) id: number) {

return this.productsService.findOne(id);

}

\@Patch(\':id\')

update(@Param(\'id\', ParseIntPipe) id: number, \@Body() dto:
UpdateProductDto) {

return this.productsService.update(id, dto);

}

\@Delete(\':id\')

remove(@Param(\'id\', ParseIntPipe) id: number) {

this.productsService.remove(id);

return { message: \'Eliminado\' };

}

}

Conecta el módulo en src/products/products.module.ts (Nest ya lo hace
por ti si usaste generators). Asegúrate que ProductsModule esté
importado en AppModule.

**Paso 5 --- Activar validación global (muy importante)**

Instala paquetes de validación:

npm i class-validator class-transformer \@nestjs/swagger
swagger-ui-express

Edita src/main.ts para activar ValidationPipe global y transformación:

import { ValidationPipe } from \'@nestjs/common\';

import { NestFactory } from \'@nestjs/core\';

import { AppModule } from \'./app.module\';

async function bootstrap() {

const app = await NestFactory.create(AppModule);

app.useGlobalPipes(new ValidationPipe({

whitelist: true, // quita campos extra no definidos en DTO

forbidNonWhitelisted: true, // lanza error si envían campos no
permitidos

transform: true, // transforma tipos (string-\>number) si aplica

transformOptions: { enableImplicitConversion: true },

}));

await app.listen(3000);

}

bootstrap();

**Paso 6 --- Documentación Swagger**

En src/main.ts, agrega Swagger:

import { DocumentBuilder, SwaggerModule } from \'@nestjs/swagger\';

// \... dentro de bootstrap, antes de listen:

const config = new DocumentBuilder()

.setTitle(\'API Productos\')

.setDescription(\'CRUD de productos con NestJS\')

.setVersion(\'1.0\')

.build();

const document = SwaggerModule.createDocument(app, config);

SwaggerModule.setup(\'docs\', app, document);

Ahora tendrás
[**[http://localhost:3000/docs]{.underline}**](http://localhost:3000/docs)
con la UI de Swagger.

**Probar la API (rápido)**

Con el servidor corriendo (npm run start:dev): abrimos otra terminal con
ctrl-shift-ñ

**Crear:**

curl -X POST http://localhost:3000/products \\

-H \"Content-Type: application/json\" \\

-d \'{\"name\":\"Café latte\",\"price\":3.5,\"description\":\"Bebida
caliente\"}\'

**Listar:**

curl http://localhost:3000/products

**Detalle:**

curl http://localhost:3000/products/1

**Actualizar:**

curl -X PATCH http://localhost:3000/products/1 \\

-H \"Content-Type: application/json\" \\

-d \'{\"price\":3.9}\'

**Eliminar:**

curl -X DELETE http://localhost:3000/products/1

ejercicios prácticos

1.  Ve a GET /products.

2.  Haz clic en **Try it out** → **Execute**.

3.  Verás la lista de productos en un arreglo JSON.

Ejemplo de respuesta:

\[

{

\"id\": 1,

\"name\": \"Café latte\",

\"price\": 3.5,

\"description\": \"Bebida caliente\"

},

{

\"id\": 2,

\"name\": \"Muffin de arándanos\",

\"price\": 2.2,

\"description\": \"Recién horneado\"

}

\]

**2. Consultar un producto por ID**

En **Swagger**:

1.  Ve a GET /products/{id}.

2.  Pulsa **Try it out**.

3.  En el campo **id**, escribe el número que quieres buscar (por
    ejemplo, 1).

4.  Pulsa **Execute**.

Ejemplo de respuesta:

{

\"id\": 1,

\"name\": \"Café latte\",

\"price\": 3.5,

\"description\": \"Bebida caliente\"

}

Si el ID no existe, verás:

{

\"statusCode\": 404,

\"message\": \"Producto 99 no encontrado\",

\"error\": \"Not Found\"

}

**3. Hacerlo desde la terminal**

También puedes consultar usando curl:

**Todos los productos**

curl http://localhost:3000/products

**Un producto específico**

curl http://localhost:3000/products/1

**4. Próximos pasos para mejorar tus consultas**

Ahora mismo, findAll() en el servicio devuelve **todos los productos sin
filtros**.\
Podemos agregar **query parameters** para hacer la API más útil: esto
iría en products.controller.ts (en entities)

Ejemplo: filtrar por precio mínimo

\@Get()

findAll(@Query(\'minPrice\') minPrice?: number) {

if (minPrice) {

return this.productsService.findAll().filter(p =\> p.price \>=
minPrice);

}

return this.productsService.findAll();

}

Ahora podrías hacer:

http://localhost:3000/products?minPrice=3

y solo ver los productos con precio mayor o igual a 3.

**Entonces tu products.controller.ts quedaría**
