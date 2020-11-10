import { User } from '../../api/entities/User';

export default function NewUserNotificationTemplate(user: User) {
  const dateRegistered = new Date(user.createdAt);
  return (
    '<div>' +
    `<h5>New User: <strong>${user.firstName} ${user.lastName}</strong></h5>` +
    `<p><strong>ID: </strong>${user.id}</p>` +
    `<p><strong>Email: </strong>${user.email}</p>` +
    `<p><strong>Role: </strong>${user.role}</p>` +
    `<p><strong>Date Registered: </strong>${dateRegistered.getFullYear()}-${
      dateRegistered.getMonth() + 1
    }-${dateRegistered.getDate()}` +
    `<em> ${dateRegistered.getHours()}:${dateRegistered.getMinutes()}</em></p>` +
    '</div>'
  );
}
