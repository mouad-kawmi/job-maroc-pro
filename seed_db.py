import sqlite3

def seed():
    conn = sqlite3.connect('web/jobs.db')
    cursor = conn.cursor()
    
    # Create table if not exists
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            organization TEXT,
            title TEXT,
            posts TEXT,
            deadline TEXT,
            url TEXT UNIQUE,
            content_html TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    sample_jobs = [
        (
            "وزارة الصحة والحماية الاجتماعية",
            "مباراة لتوظيف تقنيين من الدرجة الثالثة (25 منصب)",
            "25 منصب",
            "30 مارس 2026",
            "https://example.com/job1",
            "### فرصة عمل بوزارة الصحة\n\nتعلن وزارة الصحة والحماية الاجتماعية عن تنظيم مباراة لتوظيف **تقنيين من الدرجة الثالثة** في عدة تخصصات.\n\n#### المهام الرئيسية:\n- الدعم التقني في المراكز الاستشفائية.\n- صيانة المعدات الطبية.\n\n\n| المنصب | آخر أجل | رابط التقديم |\n| :--- | :--- | :--- |\n| تقني من الدرجة 3 | 30 مارس 2026 | [اضغط هنا للتقديم](https://example.com/apply) |\n\n\n> **نصيحة:** احرص على إعداد ملف ترشيح كامل يتضمن كافة الشواهد المطلوبة."
        ),
        (
            "المجلس الأعلى للحسابات",
            "توظيف متصرفين من الدرجة الثانية (10 مناصب)",
            "10 مناصب",
            "5 أبريل 2026",
            "https://example.com/job2",
            "### توظيف بالوزارة العليا\n\nيرغب المجلس الأعلى للحسابات في استقطاب كفاءات جديدة في مجال التدقيق والمحاسبة.\n\n#### الشروط:\n- شهادة الماستر أو ما يعادلها.\n- خبرة لا تقل عن سنتين.\n\n\n| المنصب | آخر أجل | رابط التقديم |\n| :--- | :--- | :--- |\n| متصرف (د2) | 05 أبريل 2026 | [رابط التسجيل](https://example.com/apply2) |\n\n\n✅ **ملاحظة:** سيتم إجراء الاختبارات الشفوية بالرباط."
        )
    ]
    
    for job in sample_jobs:
        try:
            cursor.execute('''
                INSERT INTO jobs (organization, title, posts, deadline, url, content_html)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', job)
        except sqlite3.IntegrityError:
            pass
            
    conn.commit()
    conn.close()
    print("[+] Database seeded with sample jobs!")

if __name__ == "__main__":
    seed()
