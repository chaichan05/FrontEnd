-- ============================================================
--  frontend_test  |  init.sql (FIXED UTF8MB4)
-- ============================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

CREATE DATABASE IF NOT EXISTS frontend_test
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE frontend_test;

-- ── Table: departments ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS departments (
  id         INT          NOT NULL AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_dept_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Table: users ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT          NOT NULL AUTO_INCREMENT,
  first_name    VARCHAR(100) NOT NULL,
  last_name     VARCHAR(100) NOT NULL,
  age           TINYINT UNSIGNED NOT NULL,
  gender        ENUM('male','female','unspecified') NOT NULL DEFAULT 'unspecified',
  email         VARCHAR(255) NOT NULL,
  phone         VARCHAR(20)  DEFAULT NULL,
  department_id INT          DEFAULT NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE  KEY uq_email (email),
  FOREIGN KEY fk_dept (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Table: addresses ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS addresses (
  id          INT          NOT NULL AUTO_INCREMENT,
  user_id     INT          NOT NULL,
  house_no    VARCHAR(20)  NOT NULL,
  street      VARCHAR(100) DEFAULT NULL,
  district    VARCHAR(100) NOT NULL,
  province    VARCHAR(100) NOT NULL,
  postal_code VARCHAR(10)  NOT NULL,
  PRIMARY KEY (id),
  UNIQUE  KEY uq_user_address (user_id),
  FOREIGN KEY fk_user (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Seed: departments (6 แผนก) ───────────────────────────────
INSERT INTO departments (name) VALUES
  ('วิศวกรรมซอฟต์แวร์'),
  ('การตลาด'),
  ('ทรัพยากรบุคคล'),
  ('การเงินและบัญชี'),
  ('ปฏิบัติการ'),
  ('วิจัยและพัฒนา');

-- ── Seed: users (20 คน) ──────────────────────────────────────
--  department_id: บางคนไม่มีแผนก (NULL) เพื่อทดสอบ LEFT JOIN
INSERT INTO users (first_name, last_name, age, gender, email, phone, department_id) VALUES
  ('สมชาย',    'ใจดี',        28, 'male',        'somchai.j@example.com',     '081-234-5678', 1),
  ('สมหญิง',   'รักเรียน',    24, 'female',      'somying.r@example.com',     '082-345-6789', 2),
  ('วิชัย',    'มีสุข',       35, 'male',        'wichai.m@example.com',      '083-456-7890', 1),
  ('นภา',      'สดใส',        22, 'female',      'napa.s@example.com',        '084-567-8901', 3),
  ('ประพันธ์',  'ทองดี',       42, 'male',        'praphan.t@example.com',     '085-678-9012', 4),
  ('มาลี',     'บุญมา',       31, 'female',      'malee.b@example.com',       '086-789-0123', 2),
  ('อนุชา',    'พึ่งพา',      27, 'male',        'anucha.p@example.com',      '087-890-1234', 5),
  ('จันทร์',   'แสงทอง',      29, 'female',      'jan.s@example.com',         '088-901-2345', 6),
  ('ธนพล',     'วงศ์สว่าง',   33, 'male',        'thanaphon.w@example.com',   '089-012-3456', 1),
  ('พิมพ์',    'จันทร์เพ็ญ',  26, 'female',      'pim.c@example.com',         '090-123-4567', 3),
  ('เอกชัย',   'ศรีวิชัย',    38, 'male',        'eakchai.s@example.com',     '091-234-5678', 6),
  ('รัตนา',    'ดวงดี',       21, 'female',      'rattana.d@example.com',     '092-345-6789', 4),
  ('สุรชัย',   'พันธุ์ดี',    45, 'male',        'surachai.p@example.com',    '093-456-7890', 5),
  ('กนกวรรณ',  'ชาญชัย',      23, 'female',      'kanokwan.c@example.com',    '094-567-8901', 2),
  ('ณัฐพล',    'เจริญสุข',    30, 'male',        'nattaphon.j@example.com',   '095-678-9012', 1),
  ('อรทัย',    'มาลาวงศ์',    34, 'female',      'orathai.m@example.com',     '096-789-0123', 3),
  ('ปิยะ',     'สุขสวัสดิ์',  19, 'male',        'piya.s@example.com',        '097-890-1234', NULL),
  ('วรรณา',    'ทองแท้',      40, 'female',      'wanna.t@example.com',       '098-901-2345', NULL),
  ('ชาญณรงค์', 'ศรีสุวรรณ',   36, 'male',        'channnarong.s@example.com', '099-012-3456', NULL),
  ('พรทิพย์',  'ไทยแท้',      25, 'unspecified', 'pornthip.t@example.com',    NULL,           NULL);

-- ── Seed: addresses (15 คน มีที่อยู่, 5 คนไม่มี) ─────────────
INSERT INTO addresses (user_id, house_no, street, district, province, postal_code) VALUES
  (1,  '12/3',  'ถ.สุขุมวิท',    'คลองเตย',      'กรุงเทพมหานคร', '10110'),
  (2,  '45',    'ถ.ลาดพร้าว',    'ลาดพร้าว',     'กรุงเทพมหานคร', '10230'),
  (3,  '7',     'ถ.รัชดาภิเษก',  'ห้วยขวาง',     'กรุงเทพมหานคร', '10310'),
  (4,  '88/1',  'ถ.นิมมานเหมินท์','สุเทพ',        'เชียงใหม่',     '50200'),
  (5,  '23',    'ถ.ท่าแพ',       'ช้างคลาน',     'เชียงใหม่',     '50100'),
  (6,  '101',   'ถ.เจริญกรุง',   'บางรัก',       'กรุงเทพมหานคร', '10500'),
  (7,  '55/2',  'ถ.พระราม 9',    'ห้วยขวาง',     'กรุงเทพมหานคร', '10310'),
  (8,  '3',     'ถ.บางนา',       'บางนา',        'กรุงเทพมหานคร', '10260'),
  (9,  '19',    'ถ.อโศก',        'วัฒนา',        'กรุงเทพมหานคร', '10110'),
  (10, '67',    'ถ.สีลม',        'บางรัก',       'กรุงเทพมหานคร', '10500'),
  (11, '200',   'ถ.มิตรภาพ',     'เมืองขอนแก่น', 'ขอนแก่น',       '40000'),
  (12, '14/5',  'ถ.โคราช',       'เมืองนครราชสีมา','นครราชสีมา',   '30000'),
  (13, '9',     'ถ.ราชดำเนิน',   'เมืองเชียงราย','เชียงราย',      '57000'),
  (14, '33',    'ถ.สุราษฎร์',    'เมืองสุราษฎร์ธานี','สุราษฎร์ธานี','84000'),
  (15, '77/8',  'ถ.พัทยา',       'บางละมุง',     'ชลบุรี',        '20150');
  -- user 16-20 ไม่มีที่อยู่ (ทดสอบ LEFT JOIN)
