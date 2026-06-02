# 📘 FitTrack – Frontend  
# Sprint 5 – Documentación y Modelado (Frontend)

Este repositorio contiene el **Frontend de FitTrack**, una SPA desarrollada en **React**.  
Su responsabilidad principal es gestionar toda la **interacción del usuario**, comunicar con la **API REST del Backend** y presentar datos visuales coherentes con la arquitectura del proyecto.

Este documento incluye:

- Diagramas de actividad del flujo de usuario  
- Código PlantUML + imagen correspondiente  
- Referencias al backend cuando la lógica pertenece allí  

---

## 🧭 1. Relación con Backend

El Frontend se comunica con la API del Backend mediante HTTP/JSON.  
Toda la capa de lógica de negocio, validaciones, reglas automáticas, repositorios y persistencia está documentada en:

👉 **FitTrack Backend:**  
https://github.com/usuario/FitTrack-Backend

---

## 🎨 2. Estructura del Frontend
```
/src
/components
/pages
/hooks
/services
/docs
/sprint5
/actividades

yaml
```
---

## 🧩 3. Diagramas de Actividad (Frontend)

### A1 – Registro de usuario**

```
```plantuml
@startuml
title A1 - Registro de usuario

skinparam activity {
  BackgroundColor #fafafa
  BorderColor #ff7849
  ArrowColor #ff7849
}

start


partition "Usuario" {
  :Abre la pantalla de registro;
}

partition "Frontend (React)" {
  :Mostrar formulario de registro\n(nombre, email, contraseña...);
  :Usuario rellena el formulario;
  :Validar datos en cliente\n(campos obligatorios, formato email, longitud contraseña);
}

if ("¿Datos válidos?" ) then (No)
  :Mostrar mensajes de error;
  -up-> :Usuario corrige datos;
endif

stop
@enduml
```

![Diagrama de Secuancia](/Sprint5//)


### A2 – Inicio de sesión

```plantuml
@startuml
title A2 - Inicio de sesión

skinparam activity {
  BackgroundColor #fafafa
  BorderColor #ff7849
  ArrowColor #ff7849
}

start

partition "Frontend (React)" {
  :Mostrar formulario Login;
}

partition "Usuario" {
  :Introduce email y contraseña;
}

partition "Frontend (React)" {
  :Validar datos en cliente;
}

stop
@enduml
```

### A3 – Recuperar contraseña

```plantuml
@startuml
title A3 - Recuperar contraseña

skinparam activity {
  BackgroundColor #fafafa
  BorderColor #ff7849
  ArrowColor #ff7849
}

start

partition "Usuario" {
  :Selecciona \"Olvidé mi contraseña\";
}

partition "Frontend (React)" {
  :Mostrar formulario de recuperación;
  :Validar email en cliente;
}

stop
@enduml
```

### A4 – Onboarding inicial

```plantuml
@startuml
title A4 - Onboarding inicial

skinparam activity {
  BackgroundColor #fafafa
  BorderColor #ff7849
  ArrowColor #ff7849
}

start
partition "Frontend (React)" {
  :Detectar usuario con onboarding pendiente;
  :Mostrar formulario por pasos\n(datos físicos + objetivo);
  :Validar datos en cliente;
}
stop
@enduml
```

### A5 – Navegación desde Dashboard

```plantuml
@startuml
title A5 - Navegación desde el Dashboard

skinparam activity {
  BackgroundColor #fafafa
  BorderColor #ff7849
  ArrowColor #ff7849
}

start
partition "Frontend (React)" {
  :Mostrar resumen semanal,\npróximas sesiones y accesos rápidos;
}
stop
@enduml
```

### A6 – Registrar sesión de entrenamiento

```plantuml
@startuml
title A6 - Registrar sesión de entrenamiento

skinparam activity {
  BackgroundColor #fafafa
  BorderColor #ff7849
  ArrowColor #ff7849
}

start
partition "Frontend (React)" {
  :Mostrar formulario sesión;
  :Seleccionar ejercicios del catálogo;
  :Añadir sets (reps/peso);
  :Validar datos en cliente;
}
stop
@enduml
```

### A7 – Consultar calendario

```plantuml
@startuml
title A7 - Consultar calendario

skinparam activity {
  BackgroundColor #fafafa
  BorderColor #ff7849
  ArrowColor #ff7849
}

start
partition "Frontend (React)" {
  :Mostrar calendario mensual/semanal;
  :Seleccionar día para ver sesiones;
}
stop
@enduml
```

### A8 – Crear objetivo personal

```plantuml
@startuml
title A8 - Crear objetivo personal

skinparam activity {
  BackgroundColor #fafafa
  BorderColor #ff7849
  ArrowColor #ff7849
}

start
partition "Frontend (React)" {
  :Mostrar formulario nuevo objetivo;
  :Validar datos;
}
stop
@enduml
```

### A11 – Crear publicación

```plantuml
@startuml
title A11 - Crear publicación en Fitgram

skinparam activity {
  BackgroundColor #fafafa
  BorderColor #ff7849
  ArrowColor #ff7849
}

start
partition "Frontend (React)" {
  :Mostrar editor de publicación;
  :Validar contenido;
}
stop
@enduml
```

### A12 – Comentar / Like

```plantuml
@startuml
title A12 - Interacción con publicación (comentario / like)

skinparam activity {
  BackgroundColor #fafafa
  BorderColor #ff7849
  ArrowColor #ff7849
}

start
partition "Frontend (React)" {
  :Mostrar cuadro de comentario\nO alternar estado de like;
}
stop
@enduml
```

### A13 – Unirse a un reto

```plantuml
@startuml
title A13 - Unirse a un reto

skinparam activity {
  BackgroundColor #fafafa
  BorderColor #ff7849
  ArrowColor #ff7849
}

start
partition "Frontend (React)" {
  :Mostrar detalle de reto;
  :Permitir unirse;
}
stop
@enduml
```

### A14 – Crear reto

```plantuml
@startuml
title A14 - Crear reto

skinparam activity {
  BackgroundColor #fafafa
  BorderColor #ff7849
  ArrowColor #ff7849
}

start
partition "Frontend (React)" {
  :Mostrar formulario de creación de reto;
  :Validar datos;
}
stop
@enduml
```

### A15 – Editar perfil

```plantuml
@startuml
title A15 - Editar perfil

skinparam activity {
  BackgroundColor #fafafa
  BorderColor #ff7849
  ArrowColor #ff7849
}

start
partition "Frontend (React)" {
  :Mostrar formulario de edición;
  :Validar datos;
}
stop
@enduml
```

### A16 – Enviar mensaje de soporte

```plantuml
@startuml
title A16 - Enviar mensaje de soporte

skinparam activity {
  BackgroundColor #fafafa
  BorderColor #ff7849
  ArrowColor #ff7849
}

start
partition "Frontend (React)" {
  :Mostrar formulario de contacto;
  :Validar asunto y mensaje;
}
stop
@enduml
```

## 🔗 4. Actividades documentadas en el Backend
El diagrama A10 – Desbloqueo automático de logros pertenece al backend
(porque es lógica interna sin intervención del usuario).

Además, el backend contiene:

Diagramas de Secuencia (SD1–SD12)

Diagramas JSON

Diagrama de Componentes

Diagrama IE (MySQL)

Consulta el repositorio:

👉 https://github.com/usuario/FitTrack-Backend