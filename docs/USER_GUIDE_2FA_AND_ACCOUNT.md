# Guide Utilisateur - 2FA & Compte Marchand

## 1. Comment activer l'authentification à deux facteurs (2FA)

L'authentification à deux facteurs (2FA) protège votre compte en exigeant un code à 6 chiffres en plus de votre mot de passe.

### Étape 1 : Installer une application d'authentification

Téléchargez l'une de ces applications gratuites sur votre téléphone :
- **Google Authenticator** (Android/iOS) — recommandée
- **Microsoft Authenticator** (Android/iOS)
- **Authy** (Android/iOS)
- **1Password** (si vous utilisez déjà 1Password)

### Étape 2 : Aller dans les paramètres

1. Connectez-vous à votre compte
2. Cliquez sur votre **avatar** en haut à droite → **Profil**
3. Dans la section **Authentification à deux facteurs**, cliquez sur **Activer**

Ou directement : allez sur `/settings/two-factor` ou `/two-factor-setup`

### Étape 3 : Scanner le QR Code

1. Cliquez sur **Générer la configuration**
2. Ouvrez Google Authenticator sur votre téléphone
3. Appuyez sur **+** puis **Scanner un QR code**
4. Pointez votre caméra vers le QR code affiché à l'écran
5. L'application affichera immédiatement un code à 6 chiffres qui change toutes les 30 secondes

### Étape 4 : Valider le code

1. Entrez le code à 6 chiffres affiché dans Google Authenticator
2. Cliquez sur **Activer la 2FA**
3. **IMPORTANT** : Notez ou imprimez les **codes de secours** affichés (8 codes à 6 chiffres)
   - Conservez-les dans un endroit sûr (gestionnaire de mots de passe, coffre-fort)
   - Ils vous permettront de vous connecter si vous perdez votre téléphone

### Étape 5 : Utilisation quotidienne

À chaque connexion ou opération sensible (transferts, génération de clé API), entrez le code actuel affiché dans Google Authenticator.

### Que faire si je perds mon téléphone ?

1. Utilisez un de vos **codes de secours** sur la page de connexion
2. Si vous n'avez plus vos codes, contactez le support pour réinitialiser

### Opérations protégées par la 2FA

- Connexion au compte
- Transferts d'argent
- Génération de nouvelles clés API marchandes

---

## 2. Pourquoi "Compte : Non attribué" s'affiche

Quand vous vous inscrivez, un **compte financier** (compte bancaire interne) doit être créé automatiquement. Si vous voyez "Compte : Non attribué", cela signifie que ce compte n'existe pas encore.

### Solution automatique

1. Allez sur votre **Dashboard** (`/dashboard`)
2. Vous verrez un **bandeau jaune** : "Aucun compte attribué"
3. Cliquez sur **Créer mon compte**
4. Le système crée un compte avec un solde initial de 0 (en MGA)
5. Le numéro de compte (ex: `ACC-0001-XYZ`) s'affiche immédiatement

### Après création

- Le numéro de compte apparaît automatiquement dans le **Portail Marchand** → "Informations du marchand"
- Vous pouvez maintenant recevoir des paiements, faire des transferts, etc.
- Pour ajouter des fonds, vous pouvez utiliser un moyen de paiement (carte, mobile money)

---

## 3. Pourquoi le nom de la boutique n'apparaît pas

Le **nom de la boutique** (shopName) est défini dans votre **profil marchand**.

### Créer votre profil marchand

1. Allez sur `/merchant/request`
2. Remplissez le formulaire : nom de la boutique, description, adresse, etc.
3. Soumettez la demande — elle sera en statut **PENDING**
4. Un administrateur examinera et approuvera votre demande
5. Une fois approuvée, le nom de la boutique apparaîtra dans le Portail Marchand

### Si le nom n'apparaît toujours pas

- Vérifiez que votre affiliation est en statut **APPROVED** (et non PENDING/REJECTED)
- Actualisez la page (F5)
- Le nom s'affichera dans "Informations du marchand" du Portail Marchand

---

## Support

- **Documentation** : `/docs`
- **Support** : `/support`
- **Email** : support@paysmart.local
