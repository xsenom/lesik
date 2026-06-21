import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import styles from "../workbook.module.css";
import { verifyAuthToken } from "@/lib/workbookAccess";

const rubik = { variable: "" };

export default async function WorkbookCabinetPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("workbook_access")?.value;
  const email = verifyAuthToken(token);

  if (!email) {
    redirect("/workbook/login");
  }

  return (
    <main className={`${styles.page} ${rubik.variable}`}>
      <section className={styles.card}>
        <p className={styles.eyebrow}>Доступ открыт</p>
        <h1>Рабочая тетрадь</h1>
        <p className={styles.lead}>
          Здесь лежит PDF-файл рабочей тетради. Скачайте его и сохраните у себя.
        </p>

        <div className={styles.downloadCard}>
          <div>
            <h2>PDF-файл рабочей тетради</h2>
            <p>Формат: PDF</p>
          </div>

          <a href="/api/workbook/download" className={styles.downloadButton}>
            Скачать PDF
          </a>
        </div>

        <form action="/api/workbook/logout" method="post">
          <button className={styles.logoutButton} type="submit">
            Выйти
          </button>
        </form>
      </section>
    </main>
  );
}
