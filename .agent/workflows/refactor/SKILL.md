---
description: Refactor code to improve maintainability without changing behavior. Extract functions, rename variables, break down large functions, enhance type safety, remove code smells, and apply design patterns for gradual, controlled improvements.
---

# Refactor

## Overview

Refactoring is the disciplined technique of restructuring existing code without changing its external behavior. The primary goal is to improve **readability**, **maintainability**, **testability**, and **extensibility**. It is a gradual, controlled evolution of code, not a full rewrite. This approach reduces technical debt and allows teams to add new features safely.

Refactoring should never introduce bugs; it only improves **how the code is organized, named, and structured**. Think of it as cleaning and polishing a piece of code until it shines while keeping its original functionality intact. Use this skill when you inherit messy code or when adding features becomes increasingly difficult due to poor structure.

## When to Use

Use refactoring when:

- Code is difficult to read, understand, or maintain.
- Functions or classes are too large and perform multiple responsibilities.
- Code smells are present (duplication, long parameter lists, magic numbers, nested conditionals, etc.).
- Adding features or fixing bugs is risky due to tangled or opaque code.
- You are asked to "clean up this code", "refactor this", or "improve maintainability".

Avoid using refactoring as a replacement for rewriting code from scratch unless absolutely necessary. It is about **evolution, not revolution**.

---

## Refactoring Principles

### The Golden Rules

1. **Behavior is preserved** – Refactoring changes the structure of code, not its output or behavior.
2. **Small steps** – Make tiny, incremental changes rather than massive rewrites.
3. **Version control is essential** – Commit your code before and after each refactoring step.
4. **Tests are your safety net** – Without automated tests, refactoring becomes editing with risk.
5. **One thing at a time** – Focus on a single improvement per step to maintain clarity.

### When NOT to Refactor

Refactoring is not always appropriate. Avoid it in these situations:

- Code that works and is unlikely to change (“If it ain't broke, don't fix it”).
- Critical production code without tests. Add tests first.
- Under tight deadlines where refactoring could introduce delays or bugs.
- Refactoring “just because” without a clear improvement goal.

---

## Common Code Smells & How to Fix Them

### 1. Long Method/Function

**Problem:** Functions that do too much are hard to understand, debug, or test.  
**Solution:** Break them into smaller, focused functions.

```diff
# BAD: One large function
- async function processOrder(orderId) {
-   // 50 lines: fetch order
-   // 30 lines: validate order
-   // 40 lines: calculate pricing
-   // 30 lines: update inventory
-   // 20 lines: create shipment
-   // 30 lines: send notifications
- }

# GOOD: Each task is a separate function
+ async function processOrder(orderId) {
+   const order = await fetchOrder(orderId);
+   validateOrder(order);
+   const pricing = calculatePricing(order);
+   await updateInventory(order);
+   const shipment = await createShipment(order);
+   await sendNotifications(order, pricing, shipment);
+   return { order, pricing, shipment };
+ }
# BAD: Logic repeated
- function calculateUserDiscount(user) {
-   if (user.membership === 'gold') return user.total * 0.2;
-   if (user.membership === 'silver') return user.total * 0.1;
-   return 0;
- }
-
- function calculateOrderDiscount(order) {
-   if (order.user.membership === 'gold') return order.total * 0.2;
-   if (order.user.membership === 'silver') return order.total * 0.1;
-   return 0;
- }

# GOOD: Centralize logic
+ function getMembershipDiscountRate(membership) {
+   const rates = { gold: 0.2, silver: 0.1 };
+   return rates[membership] || 0;
+ }
+
+ function calculateUserDiscount(user) {
+   return user.total * getMembershipDiscountRate(user.membership);
+ }
+
+ function calculateOrderDiscount(order) {
+   return order.total * getMembershipDiscountRate(order.user.membership);
+ }
# BAD: Monolithic class
- class UserManager {
-   createUser() { /* ... */ }
-   updateUser() { /* ... */ }
-   deleteUser() { /* ... */ }
-   sendEmail() { /* ... */ }
-   generateReport() { /* ... */ }
-   handlePayment() { /* ... */ }
-   validateAddress() { /* ... */ }
-   // 50 more methods...
- }

# GOOD: Single responsibility per class
+ class UserService {
+   create(data) { /* ... */ }
+   update(id, data) { /* ... */ }
+   delete(id) { /* ... */ }
+ }
+
+ class EmailService {
+   send(to, subject, body) { /* ... */ }
+ }
+
+ class ReportService {
+   generate(type, params) { /* ... */ }
+ }
+
+ class PaymentService {
+   process(amount, method) { /* ... */ }
+ }
# BAD
- function createUser(email, password, name, age, address, city, country, phone) {
-   /* ... */
- }

# GOOD
+ interface UserData {
+   email: string;
+   password: string;
+   name: string;
+   age?: number;
+   address?: Address;
+   phone?: string;
+ }
+
+ function createUser(data: UserData) { /* ... */ }
+
+ // Builder pattern for complex construction
+ const user = UserBuilder
+   .email('test@example.com')
+   .password('secure123')
+   .name('Test User')
+   .address(address)
+   .build();
# BAD
- class Order {
-   calculateDiscount(user) {
-     if (user.membershipLevel === 'gold') return this.total * 0.2;
-     if (user.accountAge > 365) return this.total * 0.1;
-     return 0;
-   }
- }

# GOOD
+ class User {
+   getDiscountRate(orderTotal) {
+     if (this.membershipLevel === 'gold') return 0.2;
+     if (this.accountAge > 365) return 0.1;
+     return 0;
+   }
+ }
+
+ class Order {
+   calculateDiscount(user) {
+     return this.total * user.getDiscountRate(this.total);
+   }
+ }
# BAD
- function sendEmail(to, subject, body) { /* ... */ }
- sendEmail('user@example.com', 'Hello', '...');

# GOOD
+ class Email {
+   private constructor(public readonly value: string) {
+     if (!Email.isValid(value)) throw new Error('Invalid email');
+   }
+   static create(value: string) { return new Email(value); }
+   static isValid(email: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
+ }
+
+ class PhoneNumber {
+   constructor(public readonly country: string, public readonly number: string) {
+     if (!PhoneNumber.isValid(country, number)) throw new Error('Invalid phone');
+   }
+   toString() { return `${this.country}-${this.number}`; }
+   static isValid(country: string, number: string) { /* validation */ }
+ }
+
+ const email = Email.create('user@example.com');
+ const phone = new PhoneNumber('1', '555-1234');
# BAD
- if (user.status === 2) { /* ... */ }
- const discount = total * 0.15;
- setTimeout(callback, 86400000);

# GOOD
+ const UserStatus = { ACTIVE: 1, INACTIVE: 2, SUSPENDED: 3 } as const;
+ const DISCOUNT_RATES = { STANDARD: 0.1, PREMIUM: 0.15, VIP: 0.2 } as const;
+ const ONE_DAY_MS = 24 * 60 * 60 * 1000;
+
+ if (user.status === UserStatus.INACTIVE) { /* ... */ }
+ const discount = total * DISCOUNT_RATES.PREMIUM;
+ setTimeout(callback, ONE_DAY_MS);
# BAD
- function process(order) {
-   if (order) {
-     if (order.user) {
-       if (order.user.isActive) {
-         if (order.total > 0) return processOrder(order);
-       }
-     }
-   }
- }

# GOOD
+ function process(order) {
+   if (!order) return { error: 'No order' };
+   if (!order.user) return { error: 'No user' };
+   if (!order.user.isActive) return { error: 'User inactive' };
+   if (order.total <= 0) return { error: 'Invalid total' };
+   return processOrder(order);
+ }

# EVEN BETTER
+ function process(order): Result<ProcessedOrder, Error> {
+   return Result.combine([
+     validateOrderExists(order),
+     validateUserExists(order),
+     validateUserActive(order.user),
+     validateOrderTotal(order)
+   ]).flatMap(() => processOrder(order));
+ }
# BAD
- function oldImplementation() { /* ... */ }
- const DEPRECATED_VALUE = 5;
- import { unusedThing } from './somewhere';

# GOOD
+ // Removed unused code
# BAD
- order.user.profile.address.street;
- order.repository.connection.config;

# GOOD
+ order.getShippingAddress();
+ order.save();
# Before
- function printReport(users) {
-   console.log('USER REPORT');
-   console.log('============');
-   console.log(`Total users: ${users.length}`);
-   // active users
-   const active = users.filter(u => u.isActive);
-   active.forEach(u => console.log(`- ${u.name} (${u.email})`));
-   // inactive users
-   const inactive = users.filter(u => !u.isActive);
-   inactive.forEach(u => console.log(`- ${u.name} (${u.email})`));
- }

# After
+ function printReport(users) {
+   printHeader('USER REPORT');
+   console.log(`Total users: ${users.length}\n`);
+   printUserSection('ACTIVE USERS', users.filter(u => u.isActive));
+   printUserSection('INACTIVE USERS', users.filter(u => !u.isActive));
+ }
+
+ function printHeader(title) {
+   console.log(title);
+   console.log('='.repeat(title.length));
+   console.log('');
+ }
+
+ function printUserSection(title, users) {
+   console.log(title);
+   console.log('-'.repeat(title.length));
+   users.forEach(u => console.log(`- ${u.name} (${u.email})`));
+   console.log('');
+   console.log(`${title.split(' ')[0]}: ${users.length}\n`);
+ }
# Before
- function calculateDiscount(user, total, membership, date) { /* ... */ }

# After
+ type Membership = 'bronze' | 'silver' | 'gold';
+
+ interface User { id: string; name: string; membership: Membership; }
+ interface DiscountResult { original: number; discount: number; final: number; rate: number; }
+
+ function calculateDiscount(user: User, total: number, date: Date = new Date()): DiscountResult {
+   if (total < 0) throw new Error('Total cannot be negative');
+   let rate = 0.1;
+   if (user.membership === 'gold' && date.getDay() === 5) rate = 0.25;
+   else if (user.membership === 'gold') rate = 0.2;
+   else if (user.membership === 'silver') rate = 0.15;
+   const discount = total * rate;
+   return { original: total, discount, final: total - discount, rate };
+ }
# Before: Conditional logic
- function calculateShipping(order, method) { /* ... */ }

# After
+ interface ShippingStrategy { calculate(order: Order): number; }
+ class StandardShipping implements ShippingStrategy { calculate(order: Order) { return order.total > 50 ? 0 : 5.99; } }
+ class ExpressShipping implements ShippingStrategy { calculate(order: Order) { return order.total > 100 ? 9.99 : 14.99; } }
+ class OvernightShipping implements ShippingStrategy { calculate(order: Order) { return 29.99; } }
+
+ function calculateShipping(order: Order, strategy: ShippingStrategy) { return strategy.calculate(order); }
# Before: Nested validation
- function validate(user) { /* ... */ }

# After
+ abstract class Validator {
+   next?: Validator;
+   setNext(validator: Validator) { this.next = validator; return validator; }
+   validate(user: User): string | null {
+     const error = this.doValidate(user);
+     if (error) return error;
+     return this.next?.validate(user) ?? null;
+   }
+   abstract doValidate(user: User): string | null;
+ }
+
+ class EmailRequiredValidator extends Validator { doValidate(user: User) { return !user.email ? 'Email required' : null; } }
+ class EmailFormatValidator extends Validator { doValidate(user: User) { return user.email && !isValidEmail(user.email) ? 'Invalid email' : null; } }
+
+ const validator = new EmailRequiredValidator()
+   .setNext(new EmailFormatValidator())
+   .setNext(new NameRequiredValidator())
+   .setNext(new AgeValidator())
+   .setNext(new CountryValidator());
