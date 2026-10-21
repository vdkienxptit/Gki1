import { useEffect, useState } from "react";
import "./index.css";

type BaiViet = {
  userId?: number;
  id: number;
  title: string;
  body: string;
};

type BinhLuan = {
  id: number;
  name: string;
  email: string;
  body: string;
};

type NguoiDung = {
  username: string;
};

function App() {
  const [danhSachBaiViet, setDanhSachBaiViet] = useState<BaiViet[]>([]);
  const [danhSachBinhLuan, setDanhSachBinhLuan] = useState<BinhLuan[]>([]);
  const [tuKhoa, setTuKhoa] = useState("");
  const [dangTai, setDangTai] = useState(false);
  const [loi, setLoi] = useState("");
  const [duongDan, setDuongDan] = useState(window.location.pathname);

  const [nguoiDung, setNguoiDung] = useState<NguoiDung | null>(() => {
    const duLieu = localStorage.getItem("currentUser");

    if (duLieu) {
      try {
        return JSON.parse(duLieu) as NguoiDung;
      } catch {
        localStorage.removeItem("currentUser");
      }
    }

    return null;
  });

  const [tieuDe, setTieuDe] = useState("");
  const [noiDung, setNoiDung] = useState("");

  useEffect(() => {
    function capNhatDuongDan() {
      setDuongDan(window.location.pathname);
    }

    window.addEventListener("popstate", capNhatDuongDan);

    return () => {
      window.removeEventListener("popstate", capNhatDuongDan);
    };
  }, []);

  useEffect(() => {
    async function layBaiViet() {
      setDangTai(true);
      setLoi("");

      try {
        const phanHoi = await fetch(
          "https://jsonplaceholder.typicode.com/posts"
        );

        if (!phanHoi.ok) {
          throw new Error("Không thể lấy danh sách bài viết.");
        }

        const duLieu: BaiViet[] = await phanHoi.json();

        const baiVietDaLuu = localStorage.getItem("miniBlogPosts");
        let baiVietMoi: BaiViet[] = [];

        if (baiVietDaLuu) {
          try {
            baiVietMoi = JSON.parse(baiVietDaLuu) as BaiViet[];
          } catch {
            localStorage.removeItem("miniBlogPosts");
          }
        }

        setDanhSachBaiViet([...baiVietMoi, ...duLieu]);
      } catch {
        setLoi(
          "Không thể tải bài viết. Hãy kiểm tra kết nối Internet và thử lại."
        );

        const baiVietDaLuu = localStorage.getItem("miniBlogPosts");

        if (baiVietDaLuu) {
          try {
            setDanhSachBaiViet(
              JSON.parse(baiVietDaLuu) as BaiViet[]
            );
          } catch {
            setDanhSachBaiViet([]);
          }
        }
      } finally {
        setDangTai(false);
      }
    }

    layBaiViet();
  }, []);

  const baiVietTimDuoc = danhSachBaiViet.filter((baiViet) =>
    baiViet.title.toLowerCase().includes(tuKhoa.toLowerCase())
  );

  function chuyenTrang(duongDanMoi: string) {
    window.history.pushState({}, "", duongDanMoi);
    setDuongDan(duongDanMoi);
    window.scrollTo(0, 0);
  }

  function dangNhap(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const tenDangNhap = String(formData.get("username") || "").trim();
    const matKhau = String(formData.get("password") || "");

    if (tenDangNhap === "admin" && matKhau === "123456") {
      const taiKhoan = { username: tenDangNhap };

      localStorage.setItem("currentUser", JSON.stringify(taiKhoan));
      setNguoiDung(taiKhoan);

      alert("Đăng nhập thành công!");
      chuyenTrang("/");
    } else {
      alert("Sai tên đăng nhập hoặc mật khẩu!");
    }
  }

  function dangXuat() {
    localStorage.removeItem("currentUser");
    setNguoiDung(null);
    chuyenTrang("/");
    alert("Bạn đã đăng xuất.");
  }

  function dangBai(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!nguoiDung) {
      alert("Bạn cần đăng nhập trước khi viết bài.");
      chuyenTrang("/login");
      return;
    }

    if (tieuDe.trim().length < 3) {
      alert("Tiêu đề phải có ít nhất 3 ký tự.");
      return;
    }

    if (noiDung.trim().length < 10) {
      alert("Nội dung phải có ít nhất 10 ký tự.");
      return;
    }

    const baiVietMoi: BaiViet = {
      id: Date.now(),
      userId: 1,
      title: tieuDe.trim(),
      body: noiDung.trim()
    };

    const baiVietCu = localStorage.getItem("miniBlogPosts");
    let danhSachCu: BaiViet[] = [];

    if (baiVietCu) {
      try {
        danhSachCu = JSON.parse(baiVietCu) as BaiViet[];
      } catch {
        danhSachCu = [];
      }
    }

    const danhSachMoi = [baiVietMoi, ...danhSachCu];

    localStorage.setItem("miniBlogPosts", JSON.stringify(danhSachMoi));

    setDanhSachBaiViet((danhSachHienTai) => [
      baiVietMoi,
      ...danhSachHienTai
    ]);

    setTieuDe("");
    setNoiDung("");

    alert("Đăng bài thành công!");
    chuyenTrang("/");
  }
  const duongDanChiTiet = duongDan.match(/^\/post\/(\d+)\/?$/);
  const idBaiViet = duongDanChiTiet
    ? Number(duongDanChiTiet[1])
    : null;

  const baiVietChiTiet =
    idBaiViet === null
      ? undefined
      : danhSachBaiViet.find((baiViet) => baiViet.id === idBaiViet);

  useEffect(() => {
    if (idBaiViet === null || !baiVietChiTiet) {
      setDanhSachBinhLuan([]);
      return;
    }

    let daHuy = false;

    async function layBinhLuan() {
      setDangTai(true);
      setLoi("");
      setDanhSachBinhLuan([]);

      try {
        const phanHoi = await fetch(
          `https://jsonplaceholder.typicode.com/posts/${idBaiViet}/comments`
        );

        if (!phanHoi.ok) {
          throw new Error("Không thể tải bình luận.");
        }

        const duLieu: BinhLuan[] = await phanHoi.json();

        if (!daHuy) {
          setDanhSachBinhLuan(duLieu);
        }
      } catch {
        if (!daHuy) {
          setLoi("Không thể tải bình luận. Vui lòng thử lại.");
        }
      } finally {
        if (!daHuy) {
          setDangTai(false);
        }
      }
    }

    layBinhLuan();

    return () => {
      daHuy = true;
    };
  }, [idBaiViet, baiVietChiTiet]);

  // Hiển thị đầu trang và menu
  function hienThiDauTrang() {
    return (
      <header className="dau-trang">
        <div className="thanh-menu">
          <a
            href="/"
            className="logo"
            onClick={(e) => {
              e.preventDefault();
              chuyenTrang("/");
            }}
          >
            MiniBlog
          </a>

          <nav>
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                chuyenTrang("/");
              }}
            >
              Trang chủ
            </a>

            {nguoiDung && (
              <a
                href="/write"
                onClick={(e) => {
                  e.preventDefault();
                  chuyenTrang("/write");
                }}
              >
                Viết bài
              </a>
            )}

            {nguoiDung ? (
              <>
                <span className="xin-chao">
                  Xin chào, {nguoiDung.username}
                </span>
                <button onClick={dangXuat}>Đăng xuất</button>
              </>
            ) : (
              <a
                href="/login"
                onClick={(e) => {
                  e.preventDefault();
                  chuyenTrang("/login");
                }}
              >
                Đăng nhập
              </a>
            )}
          </nav>
        </div>
      </header>
    );
  }

  function hienThiDanhSach() {
    return (
      <main className="noi-dung">
        <section className="gioi-thieu">
          <h1>Chào mừng đến với MiniBlog</h1>
          <p>Đọc, tìm kiếm và chia sẻ những bài viết của bạn.</p>
        </section>

        <section className="khung">
          <h2>Danh sách bài viết</h2>

          <input
            type="text"
            placeholder="Nhập tiêu đề cần tìm..."
            value={tuKhoa}
            onChange={(e) => setTuKhoa(e.target.value)}
          />

          {dangTai && <p>Đang tải dữ liệu, vui lòng chờ...</p>}

          {loi && (
            <div className="thong-bao-loi">
              <p>{loi}</p>
              <button onClick={() => window.location.reload()}>
                Thử lại
              </button>
            </div>
          )}

          {!dangTai && baiVietTimDuoc.length === 0 && (
            <p>Không tìm thấy bài viết nào.</p>
          )}

          <div className="danh-sach">
            {baiVietTimDuoc.map((baiViet) => (
              <article className="bai-viet" key={baiViet.id}>
                <h3>{baiViet.title}</h3>

                <p>{baiViet.body}</p>

                <button
                  onClick={() => chuyenTrang(`/post/${baiViet.id}`)}
                >
                  Xem chi tiết
                </button>
              </article>
            ))}
          </div>
        </section>
      </main>
    );
  }

  function hienThiChiTiet() {
    if (dangTai && !baiVietChiTiet) {
      return (
        <main className="noi-dung khung">
          <p>Đang tải bài viết...</p>
        </main>
      );
    }

    if (!baiVietChiTiet) {
      return (
        <main className="noi-dung khung">
          <h2>Không tìm thấy bài viết</h2>
          <button onClick={() => chuyenTrang("/")}>
            Quay về trang chủ
          </button>
        </main>
      );
    }

    return (
      <main className="noi-dung">
        <article className="khung">
          <h1>{baiVietChiTiet.title}</h1>
          <p className="noi-dung-bai-viet">{baiVietChiTiet.body}</p>

          <button onClick={() => chuyenTrang("/")}>
            Quay về trang chủ
          </button>
        </article>

        <section className="khung">
          <h2>Danh sách bình luận</h2>

          {dangTai && <p>Đang tải bình luận...</p>}

          {loi && <p className="thong-bao-loi">{loi}</p>}

          {!dangTai && !loi && danhSachBinhLuan.length === 0 && (
            <p>Chưa có bình luận hoặc không có dữ liệu.</p>
          )}

          {danhSachBinhLuan.map((binhLuan) => (
            <article className="binh-luan" key={binhLuan.id}>
              <h3>{binhLuan.name}</h3>
              <p className="email">{binhLuan.email}</p>
              <p>{binhLuan.body}</p>
            </article>
          ))}
        </section>
      </main>
    );
  }

  function hienThiDangNhap() {
    return (
      <main className="noi-dung">
        <form className="khung" onSubmit={dangNhap}>
          <h1>Đăng nhập</h1>

          <label htmlFor="username">Tên đăng nhập</label>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="Nhập tên đăng nhập"
            required
          />

          <label htmlFor="password">Mật khẩu</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Nhập mật khẩu"
            required
          />

          <p className="goi-y">
            Tài khoản mẫu: admin
            <br />
            Mật khẩu mẫu: 123456
          </p>

          <button type="submit">Đăng nhập</button>
        </form>
      </main>
    );
  }

  function hienThiVietBai() {
    if (!nguoiDung) {
      return (
        <main className="noi-dung khung">
          <h2>Bạn chưa đăng nhập</h2>
          <p>Vui lòng đăng nhập để viết bài.</p>
          <button onClick={() => chuyenTrang("/login")}>
            Đi đến đăng nhập
          </button>
        </main>
      );
    }

    return (
      <main className="noi-dung">
        <form className="khung" onSubmit={dangBai}>
          <h1>Viết bài mới</h1>

          <label htmlFor="tieu-de">Tiêu đề</label>
          <input
            id="tieu-de"
            type="text"
            placeholder="Nhập tiêu đề bài viết"
            value={tieuDe}
            onChange={(e) => setTieuDe(e.target.value)}
            minLength={3}
            required
          />

          <label htmlFor="noi-dung">Nội dung</label>
          <textarea
            id="noi-dung"
            placeholder="Nhập nội dung bài viết"
            value={noiDung}
            onChange={(e) => setNoiDung(e.target.value)}
            minLength={10}
            required
          />

          <p>Tiêu đề tối thiểu 3 ký tự, nội dung tối thiểu 10 ký tự.</p>

          <button type="submit">Đăng bài</button>
        </form>
      </main>
    );
  }

  function hienThi404() {
    return (
      <main className="noi-dung khung trang-404">
        <h1>404</h1>
        <h2>Không tìm thấy trang</h2>
        <p>Đường dẫn bạn truy cập không tồn tại.</p>
        <button onClick={() => chuyenTrang("/")}>
          Quay về trang chủ
        </button>
      </main>
    );
  }

  let noiDungTrang;

  if (duongDan === "/" || duongDan === "") {
    noiDungTrang = hienThiDanhSach();
  } else if (duongDan === "/login") {
    noiDungTrang = hienThiDangNhap();
  } else if (duongDan === "/write") {
    noiDungTrang = hienThiVietBai();
  } else if (duongDanChiTiet) {
    noiDungTrang = hienThiChiTiet();
  } else {
    noiDungTrang = hienThi404();
  }

  return (
    <div className="ung-dung">
      {hienThiDauTrang()}
      {noiDungTrang}

      <footer>
        <p>MiniBlog - Bài kiểm tra React + TypeScript</p>
      </footer>
    </div>
  );
}

export default App;