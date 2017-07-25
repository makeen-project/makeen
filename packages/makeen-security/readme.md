`makeen-security` provides a permissions-based authorization mechanism.

If you're looking for a simpler but restricted system, and you know up-front what are the available groups of users and the access to resources is decided only by the presence to these groups where no logic is involved `makeen-user` alone is a solution for dealing with authorization.

You should use `makeen-security` if:
- you intend to provide some administrative access to the groups (probably through a UI), where you want to add new groups, manage groups' permissions, organize users into groups;
- you need more granularity over the way you assign permissions to users (sometimes you just want to assign some permissions to a specific user, without having to create a group for that)
- you don't know up-front what are the groups of users (roles) of the system and you want to be able to let the admin manage that as he gets a better understanding of it; this way you just restrict access to some resources using the permissions, but you let the admin organize permissions into groups and assign users to groups;
- you want visibility over what a user can do - you can just get the list of permissions assigned to it, which is a merge between directly assigned permissions and permissions related to the groups the user is a part of. The role-based system is opaque - you don't know what a role can do, unless properly documented.
- you want to have logic involved in the decision making process; example: a user can add comments to a blog post, but he can only update them unless he's the creator of a comment and the comment hasn't been posted more than an hour ago.

The workflow behind `makeen-security` is the following:
### 1. Identifying the resources.
A resource can be pretty much anything:
  - a path (`/admin`, `/products/123`)
  - a function call
  - a business object
  - etc.
Figuring out what are the things (resources) in the which require a restricted access will be an on-going process.

### 2. Applying restrictions to these resources.
Once you identified the resources you can apply labels (permissions) to these, like `products.delete`, `isAdmin`, `sendEmail`.
It's up to you to choose a permission name that makes sense, `makeen-security` doesn't impose any restrictions to that.

You might want to associate logic to that, for example - a user can `drive.car` only if he's over 18 and he has a driving license. In this case the fact that the user has the permission is not enough, he needs to pass the test associated with it.

### 3. Assigning permissions to users.
These associations are stored in the database, and thanks to that you can handle that through a UI a (super)admin can interact with.

Often times you'll find yourself replicating the same set of permissions to multiple users. That's when you'll have to create groups, assign those permissions to the groups and then add users to the groups.
