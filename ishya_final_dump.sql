--
-- PostgreSQL database dump
--

-- Dumped from database version 16.1
-- Dumped by pg_dump version 16.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: Buyers; Type: TABLE DATA; Schema: public; Owner: postgres
--

SET SESSION AUTHORIZATION DEFAULT;

ALTER TABLE public."Buyers" DISABLE TRIGGER ALL;

INSERT INTO public."Buyers" (id, name, type, "contactPerson", email, phone, address, "createdAt", "updatedAt") VALUES (2, 'Rwanda Agnecy Board', 'TV Channel', 'Umutoni Gaella', 'ishimweaugstin12@gmail.com', '+25078923020399', 'Kigali', '2026-05-22 08:37:11.412-07', '2026-05-22 08:37:11.412-07');


ALTER TABLE public."Buyers" ENABLE TRIGGER ALL;

--
-- Data for Name: ProductionCategories; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."ProductionCategories" DISABLE TRIGGER ALL;

INSERT INTO public."ProductionCategories" (id, name, description, "createdAt", "updatedAt") VALUES (1, 'Movie', 'Film productions', '2026-05-08 04:55:32.31-07', '2026-05-08 04:55:32.31-07');
INSERT INTO public."ProductionCategories" (id, name, description, "createdAt", "updatedAt") VALUES (2, 'Theatre', 'Stage plays and drama', '2026-05-08 04:55:32.31-07', '2026-05-08 04:55:32.31-07');
INSERT INTO public."ProductionCategories" (id, name, description, "createdAt", "updatedAt") VALUES (3, 'Radio Drama', 'Audio productions', '2026-05-08 04:55:32.31-07', '2026-05-08 04:55:32.31-07');
INSERT INTO public."ProductionCategories" (id, name, description, "createdAt", "updatedAt") VALUES (4, 'Journal/Paper', 'Academic or creative writing', '2026-05-08 04:55:32.31-07', '2026-05-08 04:55:32.31-07');
INSERT INTO public."ProductionCategories" (id, name, description, "createdAt", "updatedAt") VALUES (5, 'Script', 'Stand-alone scripts', '2026-05-08 04:55:32.31-07', '2026-05-08 04:55:32.31-07');


ALTER TABLE public."ProductionCategories" ENABLE TRIGGER ALL;

--
-- Data for Name: Roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."Roles" DISABLE TRIGGER ALL;

INSERT INTO public."Roles" (id, name, description, "createdAt", "updatedAt") VALUES (1, 'Admin', 'System Administrator', '2026-05-08 04:55:32.297-07', '2026-05-08 04:55:32.297-07');
INSERT INTO public."Roles" (id, name, description, "createdAt", "updatedAt") VALUES (2, 'Production Manager', 'Manages productions and schedules', '2026-05-08 04:55:32.297-07', '2026-05-08 04:55:32.297-07');
INSERT INTO public."Roles" (id, name, description, "createdAt", "updatedAt") VALUES (3, 'Finance Officer', 'Manages budgets and expenses', '2026-05-08 04:55:32.297-07', '2026-05-08 04:55:32.297-07');
INSERT INTO public."Roles" (id, name, description, "createdAt", "updatedAt") VALUES (4, 'Writer/Director', 'Manages scripts and creative direction', '2026-05-08 04:55:32.297-07', '2026-05-08 04:55:32.297-07');
INSERT INTO public."Roles" (id, name, description, "createdAt", "updatedAt") VALUES (5, 'Actor/Talent', 'Participates in productions', '2026-05-08 04:55:32.297-07', '2026-05-08 04:55:32.297-07');
INSERT INTO public."Roles" (id, name, description, "createdAt", "updatedAt") VALUES (6, 'Public Visitor', 'Website user', '2026-05-08 04:55:32.297-07', '2026-05-08 04:55:32.297-07');
INSERT INTO public."Roles" (id, name, description, "createdAt", "updatedAt") VALUES (7, 'Partner', 'Business partner or external collaborator', '2026-05-13 14:00:38.014-07', '2026-05-13 14:00:38.014-07');
INSERT INTO public."Roles" (id, name, description, "createdAt", "updatedAt") VALUES (8, 'Buyer', 'Interested buyer of productions', '2026-05-13 14:00:38.106-07', '2026-05-13 14:00:38.106-07');


ALTER TABLE public."Roles" ENABLE TRIGGER ALL;

--
-- Data for Name: Users; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."Users" DISABLE TRIGGER ALL;

INSERT INTO public."Users" (id, "firstName", "lastName", email, password, "roleId", "profilePic", phone, status, "resetPasswordToken", "resetPasswordExpires", "createdAt", "updatedAt", "twoFactorCode", "twoFactorExpires", "isTwoFactorEnabled", "googleId", "isVerified", "emailVerifyCode", "emailVerifyExpires", "buyerId", "notificationPrefs", "subscriptionStatus", "subscriptionExpiresAt") VALUES (4, 'ishimwe', 'Patience', 'ishimweraymo@gmail.com', '$2b$10$iPv/wAQfRZRljx2zqdsyaOOg1CtE7cmNBrBJJNFe12djmSOy8N2Ri', 1, 'http://localhost:5000/uploads/file-1779538215052-641146619.png', '', 'active', NULL, NULL, '2026-05-08 05:08:51.783-07', '2026-05-27 09:39:09.018-07', '860444', '2026-05-27 09:49:09.017-07', true, NULL, true, NULL, NULL, NULL, '{"emailAlerts": true, "browserAlerts": true, "marketingEmails": false, "troubleshootingAlerts": true}', 'inactive', NULL);
INSERT INTO public."Users" (id, "firstName", "lastName", email, password, "roleId", "profilePic", phone, status, "resetPasswordToken", "resetPasswordExpires", "createdAt", "updatedAt", "twoFactorCode", "twoFactorExpires", "isTwoFactorEnabled", "googleId", "isVerified", "emailVerifyCode", "emailVerifyExpires", "buyerId", "notificationPrefs", "subscriptionStatus", "subscriptionExpiresAt") VALUES (6, 'ishimwe', 'Patience', 'ishimweaugstin12@gmail.com', '$2b$10$N9YqUwzuoD.UFdLgszniVOs77MhaadZkBOvv2/0xxAvaX3VkjUBUS', 7, 'http://localhost:5000/uploads/file-1779902858460-658703916.jfif', '', 'active', NULL, NULL, '2026-05-13 14:06:13.562-07', '2026-05-27 10:27:39.812-07', NULL, NULL, false, NULL, true, NULL, NULL, 2, '{"emailAlerts": true, "browserAlerts": true, "marketingEmails": false, "troubleshootingAlerts": true}', 'inactive', NULL);
INSERT INTO public."Users" (id, "firstName", "lastName", email, password, "roleId", "profilePic", phone, status, "resetPasswordToken", "resetPasswordExpires", "createdAt", "updatedAt", "twoFactorCode", "twoFactorExpires", "isTwoFactorEnabled", "googleId", "isVerified", "emailVerifyCode", "emailVerifyExpires", "buyerId", "notificationPrefs", "subscriptionStatus", "subscriptionExpiresAt") VALUES (5, 'Umutoni', 'Gaella', 'ishimwepatience102@gmail.com', '$2b$10$sdlAWqQ6FxPjpBoc4EQ.jeWfx7BwB7ywA5eOIGeCk8IDi/MlEDWj6', 5, NULL, NULL, 'active', NULL, NULL, '2026-05-13 08:20:41.684-07', '2026-05-13 08:28:33.96-07', NULL, NULL, false, NULL, true, NULL, NULL, NULL, '{"emailAlerts": true, "browserAlerts": true, "marketingEmails": false, "troubleshootingAlerts": true}', 'inactive', NULL);
INSERT INTO public."Users" (id, "firstName", "lastName", email, password, "roleId", "profilePic", phone, status, "resetPasswordToken", "resetPasswordExpires", "createdAt", "updatedAt", "twoFactorCode", "twoFactorExpires", "isTwoFactorEnabled", "googleId", "isVerified", "emailVerifyCode", "emailVerifyExpires", "buyerId", "notificationPrefs", "subscriptionStatus", "subscriptionExpiresAt") VALUES (9, 'ishimwe', 'patience', 'dukundanepaccy00@gmail.com', '$2b$10$MlLUOTrucjGaSzevKNhiEOTgb7y5Z/9KM5RlyPhN4AyIpNE5L/RZe', 6, NULL, NULL, 'active', NULL, NULL, '2026-05-16 02:44:45.659-07', '2026-05-27 12:15:50.229-07', NULL, NULL, false, NULL, true, NULL, NULL, NULL, '{"emailAlerts": true, "browserAlerts": true, "marketingEmails": false, "troubleshootingAlerts": true}', 'active', '2026-06-26 12:15:50.226-07');
INSERT INTO public."Users" (id, "firstName", "lastName", email, password, "roleId", "profilePic", phone, status, "resetPasswordToken", "resetPasswordExpires", "createdAt", "updatedAt", "twoFactorCode", "twoFactorExpires", "isTwoFactorEnabled", "googleId", "isVerified", "emailVerifyCode", "emailVerifyExpires", "buyerId", "notificationPrefs", "subscriptionStatus", "subscriptionExpiresAt") VALUES (10, 'Umutoni', 'Gaella', 'Umutonigaella70@gmail.com', '$2b$10$hBO0b5EUx9cqzNeZr0v5J.wqHkuCJJH6H3pUxoZ9yK8yVwFSyUGcS', 1, NULL, NULL, 'active', NULL, NULL, '2026-05-18 05:49:17.567-07', '2026-05-18 05:49:17.567-07', NULL, NULL, false, NULL, true, NULL, NULL, NULL, '{"emailAlerts": true, "browserAlerts": true, "marketingEmails": false, "troubleshootingAlerts": true}', 'inactive', NULL);
INSERT INTO public."Users" (id, "firstName", "lastName", email, password, "roleId", "profilePic", phone, status, "resetPasswordToken", "resetPasswordExpires", "createdAt", "updatedAt", "twoFactorCode", "twoFactorExpires", "isTwoFactorEnabled", "googleId", "isVerified", "emailVerifyCode", "emailVerifyExpires", "buyerId", "notificationPrefs", "subscriptionStatus", "subscriptionExpiresAt") VALUES (11, 'Umutoni', 'Gaella', 'lanalysley@gmail.com', '$2b$10$ZUUkczbsEWFaw9OzzYfdwuFNAVLaGRZJD7m1dap/DpYFsv3czKO52', 6, NULL, NULL, 'active', NULL, NULL, '2026-05-18 05:53:38.796-07', '2026-05-18 05:53:38.796-07', NULL, NULL, false, NULL, true, NULL, NULL, NULL, '{"emailAlerts": true, "browserAlerts": true, "marketingEmails": false, "troubleshootingAlerts": true}', 'inactive', NULL);
INSERT INTO public."Users" (id, "firstName", "lastName", email, password, "roleId", "profilePic", phone, status, "resetPasswordToken", "resetPasswordExpires", "createdAt", "updatedAt", "twoFactorCode", "twoFactorExpires", "isTwoFactorEnabled", "googleId", "isVerified", "emailVerifyCode", "emailVerifyExpires", "buyerId", "notificationPrefs", "subscriptionStatus", "subscriptionExpiresAt") VALUES (12, 'Abatoni', 'Keza', 'jeankubera0@gmail.com', '$2b$10$izB7h0OUXI9KoLYCq7Fq7esfsq/s6ncioPup0vKP9dqpuSvbiTd7i', 7, NULL, NULL, 'active', NULL, NULL, '2026-05-18 06:12:27.118-07', '2026-05-18 08:47:31.147-07', NULL, NULL, false, NULL, true, NULL, NULL, NULL, '{"emailAlerts": true, "browserAlerts": true, "marketingEmails": false, "troubleshootingAlerts": true}', 'inactive', NULL);


ALTER TABLE public."Users" ENABLE TRIGGER ALL;

--
-- Data for Name: Productions; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."Productions" DISABLE TRIGGER ALL;

INSERT INTO public."Productions" (id, title, description, genre, language, duration, budget, "releaseDate", status, "categoryId", "directorId", "posterUrl", "createdAt", "updatedAt", type) VALUES (2, 'Turning red', 'Turning red', 'Catoon', 'English', '', 20000000.00, '2026-05-15 17:00:00-07', 'Draft', 1, NULL, NULL, '2026-05-16 09:10:13.926-07', '2026-05-27 10:40:13.873-07', 'Movie');
INSERT INTO public."Productions" (id, title, description, genre, language, duration, budget, "releaseDate", status, "categoryId", "directorId", "posterUrl", "createdAt", "updatedAt", type) VALUES (1, 'Luca(2026)', 'He empties dustbins. She fills ballrooms. Their worlds could not be more different until the morning fate placed them in the same street, at the same moment, and love did what love always does: it ignored every rule. This is the story of two people who found gold in the most unlikely place  in each other.', 'Drama', 'Kinyarwanda', '', 10000000.00, '2026-12-08 16:00:00-08', 'Draft', 1, NULL, NULL, '2026-05-08 06:40:06.981-07', '2026-05-27 10:40:44.613-07', 'Series');


ALTER TABLE public."Productions" ENABLE TRIGGER ALL;

--
-- Data for Name: Events; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."Events" DISABLE TRIGGER ALL;

INSERT INTO public."Events" (id, title, type, "startTime", "endTime", venue, "productionId", description, status, "createdAt", "updatedAt", "posterUrl", "ticketPrice", "vipPrice", "vvipPrice", "tablePrice") VALUES (1, 'Luca in bk arena', 'Performance', '2026-07-15 02:00:00-07', '2026-07-15 06:00:00-07', 'bk arena', 1, 'We expect a lot of audience', 'Scheduled', '2026-05-09 02:17:30.718-07', '2026-05-27 05:34:17.389-07', 'http://localhost:5000/uploads/poster-1779878427116-480481444.jpg', 2000.00, 10000.00, 20000.00, 150000.00);
INSERT INTO public."Events" (id, title, type, "startTime", "endTime", venue, "productionId", description, status, "createdAt", "updatedAt", "posterUrl", "ticketPrice", "vipPrice", "vvipPrice", "tablePrice") VALUES (2, 'Turning red k-kigali', 'Performance', '2026-08-20 04:00:00-07', '2026-08-20 10:00:00-07', 'k-kigali', 2, 'lanching 2th episode', 'Scheduled', '2026-05-09 05:00:31.922-07', '2026-05-27 08:38:22.93-07', 'http://localhost:5000/uploads/poster-1779878442615-240014962.jpg', 3000.00, 20000.00, 40000.00, 350000.00);
INSERT INTO public."Events" (id, title, type, "startTime", "endTime", venue, "productionId", description, status, "createdAt", "updatedAt", "posterUrl", "ticketPrice", "vipPrice", "vvipPrice", "tablePrice") VALUES (3, 'Act-1', 'Rehearsal', '2026-05-30 06:00:00-07', '2026-05-30 12:00:00-07', 'Arena', 2, 'The film is set on the Italian Riviera in the 1950s and centers on Luca Paguro, a young sea monster boy who can assume human form while on land. WikipediaAct One  Luca''s Underwater World & First Steps on LandThe film opens beneath the sea, where Luca lives with his family herding fish. He is a curious but sheltered young sea monster whose parents strictly forbid him from going near the surface, warning him about the dangerous "land monsters" (humans) above.Ordinary boyhood conversations fill the first act — it''s an intimate, contained story rather than a broad philosophical concept. Luca sneaks up to the surface and meets Alberto, a more adventurous and free-spirited sea monster who has been secretly living on an island above water. Alberto shows Luca how their bodies transform into human form when dry, which amazes and thrills Luca.', 'Scheduled', '2026-05-29 05:57:32.006-07', '2026-05-29 05:57:32.006-07', 'http://localhost:5000/uploads/poster-1780059336612-368479393.jfif', 0.00, 0.00, 0.00, 0.00);


ALTER TABLE public."Events" ENABLE TRIGGER ALL;

--
-- Data for Name: Attendances; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."Attendances" DISABLE TRIGGER ALL;

INSERT INTO public."Attendances" (id, "userId", "eventId", "checkIn", "checkOut", status, notes, location, "createdAt", "updatedAt") VALUES (1, 5, NULL, '2026-05-13 09:12:26.261-07', '2026-05-13 09:12:29.022-07', 'Present', NULL, 'Studio A', '2026-05-13 09:12:26.262-07', '2026-05-13 09:12:29.022-07');
INSERT INTO public."Attendances" (id, "userId", "eventId", "checkIn", "checkOut", status, notes, location, "createdAt", "updatedAt") VALUES (2, 5, NULL, '2026-05-13 09:12:41.694-07', '2026-05-13 09:12:43.386-07', 'Present', NULL, 'Studio A', '2026-05-13 09:12:41.695-07', '2026-05-13 09:12:43.386-07');
INSERT INTO public."Attendances" (id, "userId", "eventId", "checkIn", "checkOut", status, notes, location, "createdAt", "updatedAt") VALUES (3, 5, NULL, '2026-05-13 09:28:07.054-07', '2026-05-13 09:28:07.599-07', 'Present', NULL, 'City of Kigali', '2026-05-13 09:28:07.061-07', '2026-05-13 09:28:07.599-07');
INSERT INTO public."Attendances" (id, "userId", "eventId", "checkIn", "checkOut", status, notes, location, "createdAt", "updatedAt") VALUES (5, 5, NULL, '2026-05-13 09:28:09.384-07', '2026-05-13 09:28:58.422-07', 'Present', NULL, 'City of Kigali', '2026-05-13 09:28:09.384-07', '2026-05-13 09:28:58.423-07');
INSERT INTO public."Attendances" (id, "userId", "eventId", "checkIn", "checkOut", status, notes, location, "createdAt", "updatedAt") VALUES (4, 5, NULL, '2026-05-13 09:28:09.239-07', '2026-05-13 09:29:03.002-07', 'Present', NULL, 'City of Kigali', '2026-05-13 09:28:09.239-07', '2026-05-13 09:29:03.002-07');
INSERT INTO public."Attendances" (id, "userId", "eventId", "checkIn", "checkOut", status, notes, location, "createdAt", "updatedAt") VALUES (6, 5, NULL, '2026-05-13 09:30:35.515-07', '2026-05-13 09:32:05.003-07', 'Present', NULL, 'KG 644 Street, Gasabo District, City of Kigali [-1.95717,30.09435]', '2026-05-13 09:30:35.516-07', '2026-05-13 09:32:05.003-07');
INSERT INTO public."Attendances" (id, "userId", "eventId", "checkIn", "checkOut", status, notes, location, "createdAt", "updatedAt") VALUES (7, 5, NULL, '2026-05-13 09:33:18.601-07', '2026-05-13 09:34:23.944-07', 'Present', NULL, 'KG 644 Street, Gasabo District, City of Kigali [-1.95717,30.09435]', '2026-05-13 09:33:18.603-07', '2026-05-13 09:34:23.944-07');
INSERT INTO public."Attendances" (id, "userId", "eventId", "checkIn", "checkOut", status, notes, location, "createdAt", "updatedAt") VALUES (8, 5, NULL, '2026-05-13 09:35:01.098-07', '2026-05-13 09:36:17.264-07', 'Present', NULL, 'KG 644 Street, Gasabo District, City of Kigali [-1.95717,30.09435]', '2026-05-13 09:35:01.099-07', '2026-05-13 09:36:17.264-07');
INSERT INTO public."Attendances" (id, "userId", "eventId", "checkIn", "checkOut", status, notes, location, "createdAt", "updatedAt") VALUES (9, 5, NULL, '2026-05-13 09:36:32.333-07', '2026-05-13 09:37:45.273-07', 'Present', NULL, 'KG 644 Street, Rwanda Biomedical Center (RBC), Gasabo District, City of Kigali [-1.95717,30.09435]', '2026-05-13 09:36:32.333-07', '2026-05-13 09:37:45.274-07');
INSERT INTO public."Attendances" (id, "userId", "eventId", "checkIn", "checkOut", status, notes, location, "createdAt", "updatedAt") VALUES (10, 5, NULL, '2026-05-13 09:38:30.512-07', '2026-05-13 09:39:07.389-07', 'Present', NULL, 'KG 644 Street, Rwanda Biomedical Center (RBC), Gasabo District, City of Kigali [-1.95717,30.09435]', '2026-05-13 09:38:30.513-07', '2026-05-13 09:39:07.389-07');
INSERT INTO public."Attendances" (id, "userId", "eventId", "checkIn", "checkOut", status, notes, location, "createdAt", "updatedAt") VALUES (11, 5, NULL, '2026-05-13 09:40:43.271-07', '2026-05-13 09:41:45.639-07', 'Present', NULL, 'KG 644 Street, Rwanda Biomedical Center (RBC), Gasabo District, City of Kigali [-1.95717,30.09435]', '2026-05-13 09:40:43.272-07', '2026-05-13 09:41:45.639-07');
INSERT INTO public."Attendances" (id, "userId", "eventId", "checkIn", "checkOut", status, notes, location, "createdAt", "updatedAt") VALUES (12, 5, NULL, '2026-05-18 05:20:53.404-07', '2026-05-18 05:21:48.949-07', 'Present', NULL, 'KG 644 Street, Rwanda Biomedical Center (RBC), Gasabo District, City of Kigali [-1.95717,30.09435]', '2026-05-18 05:20:53.408-07', '2026-05-18 05:21:48.95-07');
INSERT INTO public."Attendances" (id, "userId", "eventId", "checkIn", "checkOut", status, notes, location, "createdAt", "updatedAt") VALUES (13, 5, NULL, '2026-05-28 06:05:45.287-07', '2026-05-28 07:36:06.55-07', 'Present', NULL, 'KG 644 Street, Rwanda Biomedical Center (RBC), Gasabo District, City of Kigali [-1.95717,30.094330000000003]', '2026-05-28 06:05:45.301-07', '2026-05-28 07:36:06.552-07');


ALTER TABLE public."Attendances" ENABLE TRIGGER ALL;

--
-- Data for Name: BuyerRequests; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."BuyerRequests" DISABLE TRIGGER ALL;



ALTER TABLE public."BuyerRequests" ENABLE TRIGGER ALL;

--
-- Data for Name: Contracts; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."Contracts" DISABLE TRIGGER ALL;

INSERT INTO public."Contracts" (id, "contractNumber", terms, "expiryDate", "buyerId", "productionId", "filePath", status, "createdAt", "updatedAt") VALUES (1, 'CT-1779470939587', 'Standard distribution agreement for 1.', '2027-05-21 17:00:00-07', 2, 1, NULL, 'Active', '2026-05-22 10:28:59.587-07', '2026-05-22 10:28:59.587-07');
INSERT INTO public."Contracts" (id, "contractNumber", terms, "expiryDate", "buyerId", "productionId", "filePath", status, "createdAt", "updatedAt") VALUES (2, 'CT-1779901383174', 'Standard distribution agreement for 2.', '2027-05-26 17:00:00-07', 2, 2, NULL, 'Active', '2026-05-27 10:03:03.179-07', '2026-05-27 10:03:03.179-07');


ALTER TABLE public."Contracts" ENABLE TRIGGER ALL;

--
-- Data for Name: Expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."Expenses" DISABLE TRIGGER ALL;



ALTER TABLE public."Expenses" ENABLE TRIGGER ALL;

--
-- Data for Name: MediaFiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."MediaFiles" DISABLE TRIGGER ALL;

INSERT INTO public."MediaFiles" (id, "fileName", "filePath", "fileType", category, "productionId", "isPublic", "metaData", "createdAt", "updatedAt", season, "episodeNumber", description, format) VALUES (5, 'Luca(2026) - Trailer', 'http://localhost:5000/uploads/file-1778944004719-10351226.webm', 'Trailer', 'Drama', 1, true, NULL, '2026-05-10 04:16:16.464-07', '2026-05-16 08:38:37.325-07', 1, 1, 'He empties dustbins. She fills ballrooms. Their worlds could not be more different until the morning fate placed them in the same street, at the same moment, and love did what love always does: it ignored every rule. This is the story of two people who found gold in the most unlikely place  in each other.', 'WEBM');
INSERT INTO public."MediaFiles" (id, "fileName", "filePath", "fileType", category, "productionId", "isPublic", "metaData", "createdAt", "updatedAt", season, "episodeNumber", description, format) VALUES (6, 'Luca(2026)', 'http://localhost:5000/uploads/file-1778945864930-539485986.webm', 'Episode', 'Drama', 1, true, NULL, '2026-05-10 04:16:16.464-07', '2026-05-16 08:38:37.325-07', 1, 1, 'He empties dustbins. She fills ballrooms. Their worlds could not be more different until the morning fate placed them in the same street, at the same moment, and love did what love always does: it ignored every rule. This is the story of two people who found gold in the most unlikely place  in each other.', 'WEBM');
INSERT INTO public."MediaFiles" (id, "fileName", "filePath", "fileType", category, "productionId", "isPublic", "metaData", "createdAt", "updatedAt", season, "episodeNumber", description, format) VALUES (9, 'Luca(2026)', 'http://localhost:5000/uploads/file-1778945908537-286429458.webm', 'Episode', 'Drama', 1, true, NULL, '2026-05-16 08:38:37.312-07', '2026-05-16 08:38:37.325-07', 1, 2, 'He empties dustbins. She fills ballrooms. Their worlds could not be more different until the morning fate placed them in the same street, at the same moment, and love did what love always does: it ignored every rule. This is the story of two people who found gold in the most unlikely place  in each other.', 'WEBM');
INSERT INTO public."MediaFiles" (id, "fileName", "filePath", "fileType", category, "productionId", "isPublic", "metaData", "createdAt", "updatedAt", season, "episodeNumber", description, format) VALUES (4, 'Luca(2026) - Poster', 'http://localhost:5000/uploads/file-1778943996649-631119746.png', 'Poster', 'Drama', 1, true, NULL, '2026-05-10 04:16:16.464-07', '2026-05-16 08:38:37.325-07', 1, 1, 'He empties dustbins. She fills ballrooms. Their worlds could not be more different until the morning fate placed them in the same street, at the same moment, and love did what love always does: it ignored every rule. This is the story of two people who found gold in the most unlikely place  in each other.', 'PNG');
INSERT INTO public."MediaFiles" (id, "fileName", "filePath", "fileType", category, "productionId", "isPublic", "metaData", "createdAt", "updatedAt", season, "episodeNumber", description, format) VALUES (10, 'Turning red - Poster', 'http://localhost:5000/uploads/file-1778947846053-161554768.jfif', 'Poster', 'Commedy', 2, true, NULL, '2026-05-16 09:10:52.945-07', '2026-05-16 09:11:47.342-07', NULL, NULL, 'Turning red', 'JFIF');
INSERT INTO public."MediaFiles" (id, "fileName", "filePath", "fileType", category, "productionId", "isPublic", "metaData", "createdAt", "updatedAt", season, "episodeNumber", description, format) VALUES (12, 'Turning red - Trailer', 'http://localhost:5000/uploads/file-1778947850937-251922325.webm', 'Trailer', 'Commedy', 2, true, NULL, '2026-05-16 09:10:52.959-07', '2026-05-16 09:11:47.342-07', NULL, NULL, 'Turning red', 'WEBM');
INSERT INTO public."MediaFiles" (id, "fileName", "filePath", "fileType", category, "productionId", "isPublic", "metaData", "createdAt", "updatedAt", season, "episodeNumber", description, format) VALUES (11, 'Turning red', 'http://localhost:5000/uploads/file-1778947841070-782116473.webm', 'Full Movie', 'Commedy', 2, true, NULL, '2026-05-16 09:10:52.95-07', '2026-05-16 09:11:47.342-07', 1, 1, 'Turning red', 'WEBM');


ALTER TABLE public."MediaFiles" ENABLE TRIGGER ALL;

--
-- Data for Name: MediaInteractions; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."MediaInteractions" DISABLE TRIGGER ALL;

INSERT INTO public."MediaInteractions" (id, "userId", "mediaId", type, "createdAt", "updatedAt") VALUES (2, 9, 11, 'like', '2026-05-22 11:29:08.507-07', '2026-05-22 11:29:08.507-07');
INSERT INTO public."MediaInteractions" (id, "userId", "mediaId", type, "createdAt", "updatedAt") VALUES (3, 9, 9, 'like', '2026-05-27 02:26:34.286-07', '2026-05-27 02:26:34.286-07');
INSERT INTO public."MediaInteractions" (id, "userId", "mediaId", type, "createdAt", "updatedAt") VALUES (5, 6, 6, 'like', '2026-05-27 10:19:44.21-07', '2026-05-27 10:19:44.21-07');


ALTER TABLE public."MediaInteractions" ENABLE TRIGGER ALL;

--
-- Data for Name: Notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."Notifications" DISABLE TRIGGER ALL;

INSERT INTO public."Notifications" (id, "userId", title, message, type, "isRead", "createdAt", "updatedAt") VALUES (1, 4, 'New License Request', '"Rwanda Agnecy Board" has requested a distribution license for "Luca(2026)".', 'license_request', false, '2026-05-22 10:23:24.886-07', '2026-05-22 10:23:24.886-07');
INSERT INTO public."Notifications" (id, "userId", title, message, type, "isRead", "createdAt", "updatedAt") VALUES (2, 10, 'New License Request', '"Rwanda Agnecy Board" has requested a distribution license for "Luca(2026)".', 'license_request', false, '2026-05-22 10:23:24.886-07', '2026-05-22 10:23:24.886-07');
INSERT INTO public."Notifications" (id, "userId", title, message, type, "isRead", "createdAt", "updatedAt") VALUES (3, 6, 'License Request Approved', 'Your distribution license request for "Luca(2026)" has been approved!', 'license_approval', false, '2026-05-22 10:28:59.693-07', '2026-05-22 10:28:59.693-07');
INSERT INTO public."Notifications" (id, "userId", title, message, type, "isRead", "createdAt", "updatedAt") VALUES (5, 4, 'New License Request', '"Rwanda Agnecy Board" has requested a distribution license for "Turning red".', 'license_request', false, '2026-05-27 08:59:19.101-07', '2026-05-27 08:59:19.101-07');
INSERT INTO public."Notifications" (id, "userId", title, message, type, "isRead", "createdAt", "updatedAt") VALUES (4, 10, 'New License Request', '"Rwanda Agnecy Board" has requested a distribution license for "Turning red".', 'license_request', false, '2026-05-27 08:59:19.101-07', '2026-05-27 08:59:19.101-07');
INSERT INTO public."Notifications" (id, "userId", title, message, type, "isRead", "createdAt", "updatedAt") VALUES (7, 6, 'License Price Quoted', 'A distribution license price of 500,000 RWF has been set for "Turning red". Complete checkout to unlock.', 'license_pricing', false, '2026-05-27 09:14:06.749-07', '2026-05-27 09:14:06.749-07');
INSERT INTO public."Notifications" (id, "userId", title, message, type, "isRead", "createdAt", "updatedAt") VALUES (8, 6, 'License Request Approved', 'Your distribution license request for "Turning red" has been approved!', 'license_approval', false, '2026-05-27 10:03:03.341-07', '2026-05-27 10:03:03.341-07');
INSERT INTO public."Notifications" (id, "userId", title, message, type, "isRead", "createdAt", "updatedAt") VALUES (9, 4, 'New License Request', '"A partner" has requested a distribution license for "Luca(2026)".', 'license_request', false, '2026-05-27 11:25:37.68-07', '2026-05-27 11:25:37.68-07');
INSERT INTO public."Notifications" (id, "userId", title, message, type, "isRead", "createdAt", "updatedAt") VALUES (10, 10, 'New License Request', '"A partner" has requested a distribution license for "Luca(2026)".', 'license_request', false, '2026-05-27 11:25:37.681-07', '2026-05-27 11:25:37.681-07');
INSERT INTO public."Notifications" (id, "userId", title, message, type, "isRead", "createdAt", "updatedAt") VALUES (11, 4, 'New License Request', '"A partner" has requested a distribution license for "Turning red".', 'license_request', false, '2026-05-27 12:09:33.411-07', '2026-05-27 12:09:33.411-07');
INSERT INTO public."Notifications" (id, "userId", title, message, type, "isRead", "createdAt", "updatedAt") VALUES (12, 10, 'New License Request', '"A partner" has requested a distribution license for "Turning red".', 'license_request', false, '2026-05-27 12:09:33.412-07', '2026-05-27 12:09:33.412-07');


ALTER TABLE public."Notifications" ENABLE TRIGGER ALL;

--
-- Data for Name: PendingUsers; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."PendingUsers" DISABLE TRIGGER ALL;



ALTER TABLE public."PendingUsers" ENABLE TRIGGER ALL;

--
-- Data for Name: Talents; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."Talents" DISABLE TRIGGER ALL;

INSERT INTO public."Talents" (id, "firstName", "lastName", email, phone, specialty, skills, bio, "profilePic", availability, "portfolioUrl", "socialLinks", "createdAt", "updatedAt", "userId") VALUES (1, 'Umutoni', 'Gaella', 'ishimwepatience102@gmail.com', '0783202922', 'Actor', 'singing', '', 'http://localhost:5000/uploads/file-1778681014133-713830233.jpg', true, NULL, NULL, '2026-05-08 07:01:28.248-07', '2026-05-13 08:20:41.819-07', 5);
INSERT INTO public."Talents" (id, "firstName", "lastName", email, phone, specialty, skills, bio, "profilePic", availability, "portfolioUrl", "socialLinks", "createdAt", "updatedAt", "userId") VALUES (2, 'Umutoni', 'Keza', 'pomleo949@gmail.com', '0787766431', 'Actress', '', '', 'http://localhost:5000/uploads/file-1779109221802-74673290.png', true, NULL, NULL, '2026-05-18 06:03:54.124-07', '2026-05-18 06:03:54.124-07', NULL);


ALTER TABLE public."Talents" ENABLE TRIGGER ALL;

--
-- Data for Name: ProductionTalents; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."ProductionTalents" DISABLE TRIGGER ALL;



ALTER TABLE public."ProductionTalents" ENABLE TRIGGER ALL;

--
-- Data for Name: Revenues; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."Revenues" DISABLE TRIGGER ALL;



ALTER TABLE public."Revenues" ENABLE TRIGGER ALL;

--
-- Data for Name: Sales; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."Sales" DISABLE TRIGGER ALL;

INSERT INTO public."Sales" (id, amount, "paymentStatus", "saleType", "contractId", "productionId", date, "createdAt", "updatedAt", "buyerId", "expiryDate", "buyerName", "buyerEmail", "ticketTier", "ticketQuantity") VALUES (4, 0.00, 'Paid', 'Licensing', 1, 1, '2026-05-21 17:00:00-07', '2026-05-22 10:23:24.87-07', '2026-05-22 10:28:59.651-07', 2, '2027-05-21 17:00:00-07', NULL, NULL, NULL, 1);
INSERT INTO public."Sales" (id, amount, "paymentStatus", "saleType", "contractId", "productionId", date, "createdAt", "updatedAt", "buyerId", "expiryDate", "buyerName", "buyerEmail", "ticketTier", "ticketQuantity") VALUES (5, 500000.00, 'Paid', 'Licensing', 2, 2, '2026-05-26 17:00:00-07', '2026-05-27 08:59:19.073-07', '2026-05-27 10:03:03.29-07', 2, '2027-05-26 17:00:00-07', NULL, NULL, NULL, 1);
INSERT INTO public."Sales" (id, amount, "paymentStatus", "saleType", "contractId", "productionId", date, "createdAt", "updatedAt", "buyerId", "expiryDate", "buyerName", "buyerEmail", "ticketTier", "ticketQuantity") VALUES (6, 2000.00, 'Paid', 'Theatre ticket sales', NULL, 1, '2026-05-26 17:00:00-07', '2026-05-27 11:25:36.942-07', '2026-05-27 11:25:36.942-07', NULL, NULL, 'IshimwePatience', 'ishimwepatience102@gmail.com', 'regular', 1);
INSERT INTO public."Sales" (id, amount, "paymentStatus", "saleType", "contractId", "productionId", date, "createdAt", "updatedAt", "buyerId", "expiryDate", "buyerName", "buyerEmail", "ticketTier", "ticketQuantity") VALUES (7, 700000.00, 'Paid', 'Theatre ticket sales', NULL, 2, '2026-05-26 17:00:00-07', '2026-05-27 12:09:31.734-07', '2026-05-27 12:09:31.734-07', NULL, NULL, 'Umutoni Gaella', 'lanalysley@gmail.com', 'table', 2);
INSERT INTO public."Sales" (id, amount, "paymentStatus", "saleType", "contractId", "productionId", date, "createdAt", "updatedAt", "buyerId", "expiryDate", "buyerName", "buyerEmail", "ticketTier", "ticketQuantity") VALUES (8, 3000.00, 'Paid', 'Theatre ticket sales', NULL, 1, '2026-05-26 17:00:00-07', '2026-05-27 12:15:50.272-07', '2026-05-27 12:15:50.272-07', NULL, NULL, NULL, NULL, NULL, 1);


ALTER TABLE public."Sales" ENABLE TRIGGER ALL;

--
-- Data for Name: Scripts; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."Scripts" DISABLE TRIGGER ALL;

INSERT INTO public."Scripts" (id, title, version, "filePath", "fileType", status, "productionId", "authorId", "copyrightInfo", "createdAt", "updatedAt") VALUES (1, 'Jack Black', '1.0', 'http://localhost:5000/uploads/scripts/script-1778683531234-887952747.docx', 'DOCX', 'Draft', 1, NULL, 'Ishya propert only no one else to see', '2026-05-13 07:46:21.018-07', '2026-05-13 07:46:21.018-07');


ALTER TABLE public."Scripts" ENABLE TRIGGER ALL;

--
-- Data for Name: ScriptAssignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."ScriptAssignments" DISABLE TRIGGER ALL;

INSERT INTO public."ScriptAssignments" ("createdAt", "updatedAt", "scriptId", "talentId") VALUES ('2026-05-13 07:46:21.083-07', '2026-05-13 07:46:21.083-07', 1, 1);


ALTER TABLE public."ScriptAssignments" ENABLE TRIGGER ALL;

--
-- Data for Name: SequelizeMeta; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."SequelizeMeta" DISABLE TRIGGER ALL;

INSERT INTO public."SequelizeMeta" (name) VALUES ('20260508115812-add-email-verification-to-users.js');
INSERT INTO public."SequelizeMeta" (name) VALUES ('20260515112500-create-user-preferences.js');


ALTER TABLE public."SequelizeMeta" ENABLE TRIGGER ALL;

--
-- Data for Name: SystemSettings; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."SystemSettings" DISABLE TRIGGER ALL;

INSERT INTO public."SystemSettings" (id, key, value, "createdAt", "updatedAt") VALUES (1, 'public_monthly_subscription_price', '3000.00', '2026-05-27 02:49:23.332-07', '2026-05-27 11:46:40.494-07');


ALTER TABLE public."SystemSettings" ENABLE TRIGGER ALL;

--
-- Data for Name: UserPreferences; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."UserPreferences" DISABLE TRIGGER ALL;

INSERT INTO public."UserPreferences" (id, "userId", "pageKey", "zoomLevel", "viewMode", "createdAt", "updatedAt") VALUES (215, 5, 'actor-schedule', 72, 'grid', '2026-05-29 06:23:05.806-07', '2026-05-29 06:23:08.937-07');
INSERT INTO public."UserPreferences" (id, "userId", "pageKey", "zoomLevel", "viewMode", "createdAt", "updatedAt") VALUES (214, 5, 'dashboard', 100, 'grid', '2026-05-29 05:29:08.572-07', '2026-05-29 06:20:02.28-07');
INSERT INTO public."UserPreferences" (id, "userId", "pageKey", "zoomLevel", "viewMode", "createdAt", "updatedAt") VALUES (202, 10, 'productions', 95, 'grid', '2026-05-18 07:37:27.222-07', '2026-05-18 07:42:30.807-07');
INSERT INTO public."UserPreferences" (id, "userId", "pageKey", "zoomLevel", "viewMode", "createdAt", "updatedAt") VALUES (210, 10, 'media-library', 77, 'grid', '2026-05-18 08:55:57.75-07', '2026-05-18 08:56:04.829-07');
INSERT INTO public."UserPreferences" (id, "userId", "pageKey", "zoomLevel", "viewMode", "createdAt", "updatedAt") VALUES (191, 4, 'productions', 78, 'grid', '2026-05-15 02:35:13.188-07', '2026-05-15 02:37:53.609-07');
INSERT INTO public."UserPreferences" (id, "userId", "pageKey", "zoomLevel", "viewMode", "createdAt", "updatedAt") VALUES (193, 4, 'talents', 100, 'grid', '2026-05-15 02:36:18.025-07', '2026-05-27 02:25:16.204-07');
INSERT INTO public."UserPreferences" (id, "userId", "pageKey", "zoomLevel", "viewMode", "createdAt", "updatedAt") VALUES (192, 4, 'media-library', 34, 'grid', '2026-05-15 02:35:23.476-07', '2026-05-27 03:32:02.906-07');
INSERT INTO public."UserPreferences" (id, "userId", "pageKey", "zoomLevel", "viewMode", "createdAt", "updatedAt") VALUES (201, 10, 'talents', 100, 'grid', '2026-05-18 06:04:25.604-07', '2026-05-18 06:04:40.252-07');
INSERT INTO public."UserPreferences" (id, "userId", "pageKey", "zoomLevel", "viewMode", "createdAt", "updatedAt") VALUES (61, 6, 'media-library', 48, 'grid', '2026-05-15 02:33:49.962-07', '2026-05-27 10:09:54.604-07');
INSERT INTO public."UserPreferences" (id, "userId", "pageKey", "zoomLevel", "viewMode", "createdAt", "updatedAt") VALUES (194, 4, 'dashboard', 62, 'grid', '2026-05-15 02:39:29.295-07', '2026-05-27 10:43:51.626-07');
INSERT INTO public."UserPreferences" (id, "userId", "pageKey", "zoomLevel", "viewMode", "createdAt", "updatedAt") VALUES (197, 9, 'dashboard', 62, 'grid', '2026-05-16 04:11:22.657-07', '2026-05-16 04:11:27.586-07');
INSERT INTO public."UserPreferences" (id, "userId", "pageKey", "zoomLevel", "viewMode", "createdAt", "updatedAt") VALUES (1, 6, 'my-library', 20, 'grid', '2026-05-15 02:33:36.588-07', '2026-05-27 10:23:19.898-07');


ALTER TABLE public."UserPreferences" ENABLE TRIGGER ALL;

--
-- Data for Name: WatchProgresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."WatchProgresses" DISABLE TRIGGER ALL;

INSERT INTO public."WatchProgresses" (id, "userId", "mediaId", "productionId", "currentTime", duration, "isFinished", "lastWatched", "createdAt", "updatedAt") VALUES (4, 4, 9, 1, 192.427006, 239.088, false, '2026-05-16 08:40:40.351-07', '2026-05-16 08:38:50.357-07', '2026-05-16 08:40:40.351-07');
INSERT INTO public."WatchProgresses" (id, "userId", "mediaId", "productionId", "currentTime", duration, "isFinished", "lastWatched", "createdAt", "updatedAt") VALUES (1, 9, 6, 1, 63.608, 63.608, true, '2026-05-18 07:00:54.604-07', '2026-05-16 06:23:44.4-07', '2026-05-18 07:00:54.604-07');
INSERT INTO public."WatchProgresses" (id, "userId", "mediaId", "productionId", "currentTime", duration, "isFinished", "lastWatched", "createdAt", "updatedAt") VALUES (7, 9, 11, 2, 85.828, 85.828, true, '2026-05-27 01:58:25.137-07', '2026-05-16 09:18:29.695-07', '2026-05-27 01:58:25.137-07');
INSERT INTO public."WatchProgresses" (id, "userId", "mediaId", "productionId", "currentTime", duration, "isFinished", "lastWatched", "createdAt", "updatedAt") VALUES (8, 12, 5, 1, 9.138849, 145.508, false, '2026-05-18 07:56:04.881-07', '2026-05-18 07:55:59.952-07', '2026-05-18 07:56:04.882-07');
INSERT INTO public."WatchProgresses" (id, "userId", "mediaId", "productionId", "currentTime", duration, "isFinished", "lastWatched", "createdAt", "updatedAt") VALUES (6, 6, 5, 1, 74.946174, 145.508, false, '2026-05-16 08:47:54.094-07', '2026-05-16 08:46:44.092-07', '2026-05-16 08:47:54.094-07');
INSERT INTO public."WatchProgresses" (id, "userId", "mediaId", "productionId", "currentTime", duration, "isFinished", "lastWatched", "createdAt", "updatedAt") VALUES (9, 6, 11, 2, 4.647567, 85.828, false, '2026-05-27 10:19:25.627-07', '2026-05-27 10:19:25.628-07', '2026-05-27 10:19:25.628-07');
INSERT INTO public."WatchProgresses" (id, "userId", "mediaId", "productionId", "currentTime", duration, "isFinished", "lastWatched", "createdAt", "updatedAt") VALUES (10, 6, 6, 1, 4.872753, 63.608, false, '2026-05-27 10:19:45.645-07', '2026-05-27 10:19:45.646-07', '2026-05-27 10:19:45.646-07');
INSERT INTO public."WatchProgresses" (id, "userId", "mediaId", "productionId", "currentTime", duration, "isFinished", "lastWatched", "createdAt", "updatedAt") VALUES (5, 9, 9, 1, 239.088, 239.088, true, '2026-05-27 12:20:12.516-07', '2026-05-16 08:43:11.706-07', '2026-05-27 12:20:12.516-07');


ALTER TABLE public."WatchProgresses" ENABLE TRIGGER ALL;

--
-- Name: Attendances_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Attendances_id_seq"', 13, true);


--
-- Name: BuyerRequests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."BuyerRequests_id_seq"', 1, false);


--
-- Name: Buyers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Buyers_id_seq"', 2, true);


--
-- Name: Contracts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Contracts_id_seq"', 2, true);


--
-- Name: Events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Events_id_seq"', 3, true);


--
-- Name: Expenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Expenses_id_seq"', 1, false);


--
-- Name: MediaFiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."MediaFiles_id_seq"', 12, true);


--
-- Name: MediaInteractions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."MediaInteractions_id_seq"', 5, true);


--
-- Name: Notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Notifications_id_seq"', 12, true);


--
-- Name: PendingUsers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."PendingUsers_id_seq"', 7, true);


--
-- Name: ProductionCategories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ProductionCategories_id_seq"', 5, true);


--
-- Name: Productions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Productions_id_seq"', 3, true);


--
-- Name: Revenues_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Revenues_id_seq"', 1, false);


--
-- Name: Roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Roles_id_seq"', 8, true);


--
-- Name: Sales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Sales_id_seq"', 8, true);


--
-- Name: Scripts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Scripts_id_seq"', 1, true);


--
-- Name: SystemSettings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."SystemSettings_id_seq"', 1, true);


--
-- Name: Talents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Talents_id_seq"', 2, true);


--
-- Name: UserPreferences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."UserPreferences_id_seq"', 217, true);


--
-- Name: Users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Users_id_seq"', 12, true);


--
-- Name: WatchProgresses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."WatchProgresses_id_seq"', 10, true);


--
-- PostgreSQL database dump complete
--

