# StockFlow Pro - Application de Gestion de Stock

Application professionnelle de gestion de stock développée avec Spring Boot, Thymeleaf, Bootstrap et Material UI.

## 🚀 Technologies utilisées

- **Backend**: Spring Boot 3.2.0
- **Frontend**: Thymeleaf, Bootstrap 5.3, Material UI
- **Base de données**: MySQL
- **Sécurité**: Spring Security
- **ORM**: JPA/Hibernate

## 📋 Prérequis

- Java 17 ou supérieur
- Maven 3.6+
- MySQL 8.0+
- Node.js (optionnel, pour le développement frontend)

## 🗄️ Modélisation de la base de données

### Ordre de dépendance (du moins dépendant au plus dépendant) :

1. **User** (Utilisateur) - Table indépendante
2. **Category** (Catégorie) - Table indépendante
3. **Product** (Produit) - Dépend de User et Category
4. **Movement** (Mouvement) - Dépend de Product et User

### Structure des tables :

- `users` : Utilisateurs de l'application
- `categories` : Catégories de produits
- `products` : Produits en stock
- `movements` : Historique des entrées/sorties de stock

## ⚙️ Configuration

### 1. Configuration de la base de données

Éditez le fichier `src/main/resources/application.properties` :

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/stockflow_db?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=votre_mot_de_passe
```

### 2. Création de la base de données

La base de données sera créée automatiquement au démarrage grâce à la configuration `createDatabaseIfNotExist=true`.

Vous pouvez aussi créer manuellement la base de données dans phpMyAdmin :

```sql
CREATE DATABASE stockflow_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 🏃 Démarrage de l'application

1. **Cloner ou télécharger le projet**

2. **Configurer la base de données** dans `application.properties`

3. **Compiler et lancer l'application** :
```bash
mvn clean install
mvn spring-boot:run
```

4. **Accéder à l'application** :
   - URL : http://localhost:8080
   - Page d'accueil : http://localhost:8080/
   - Connexion : http://localhost:8080/login
   - Inscription : http://localhost:8080/register

## 📁 Structure du projet

```
src/
├── main/
│   ├── java/com/stockflow/
│   │   ├── config/          # Configuration (Sécurité, etc.)
│   │   ├── controller/      # Contrôleurs MVC
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── entity/          # Entités JPA
│   │   ├── repository/      # Repositories JPA
│   │   ├── service/         # Services métier
│   │   └── StockFlowApplication.java
│   └── resources/
│       ├── static/          # Ressources statiques (CSS, JS, images)
│       ├── templates/       # Templates Thymeleaf
│       └── application.properties
└── pom.xml
```

## 🎨 Fonctionnalités

- ✅ Authentification et gestion des utilisateurs
- ✅ Gestion des produits (CRUD)
- ✅ Gestion des catégories
- ✅ Entrées et sorties de stock
- ✅ Historique des mouvements
- ✅ Tableau de bord avec statistiques
- ✅ Recherche et filtrage des produits
- ✅ Alertes de réapprovisionnement
- ✅ Interface responsive avec Bootstrap et Material UI

## 🔐 Sécurité

- Authentification par formulaire Spring Security
- Mots de passe cryptés avec BCrypt
- Sessions utilisateur sécurisées
- Protection CSRF (à activer en production)

## 📝 Notes

- Les données sont persistées en base de données MySQL
- L'application utilise JPA/Hibernate pour l'ORM
- Les templates Thymeleaf sont intégrés avec Bootstrap 5.3
- Material Icons sont utilisés pour les icônes

## 🛠️ Développement

Pour le développement frontend avec Node.js (optionnel) :

```bash
npm install
npm run dev
```

## 📄 Licence

Ce projet est un projet éducatif de clôture de cours JAVA.

## 👨‍💻 Auteur

Projet développé dans le cadre du cours de Licence 2 - CERAP
