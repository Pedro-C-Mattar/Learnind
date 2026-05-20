package app;

import static spark.Spark.*;
import service.CategoriaService;
import service.FavoritoService;
import service.UsuarioService;
import service.VideoService;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonParseException;
import com.google.gson.JsonPrimitive;
import com.google.gson.JsonElement;
import com.google.gson.JsonSerializer;
import java.lang.reflect.Type;
import model.Usuario;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;

public class Aplicacao {
    public static void main(String[] args) {

        staticFiles.location("/public");

        get("/", (req, res) -> {
            // touch request to avoid unused param warnings
            req.session(false);
            res.redirect("/landPage/index.html");
            return null;
        });

    // services
        UsuarioService usuarioService = new UsuarioService();
        VideoService videoService = new VideoService();
        CategoriaService categoriaService = new CategoriaService();
        FavoritoService favoritoService = new FavoritoService();
    service.FeedbackService feedbackService = new service.FeedbackService();

        // Gson with LocalDate and LocalDateTime support (serialize as ISO date string)
        Gson gson = new GsonBuilder()
            .registerTypeAdapter(LocalDate.class, new JsonSerializer<LocalDate>() {
                @Override
                public JsonElement serialize(LocalDate src, Type typeOfSrc, com.google.gson.JsonSerializationContext context) {
                    return new JsonPrimitive(src.toString());
                }
            })
            .registerTypeAdapter(LocalDate.class, new JsonDeserializer<LocalDate>() {
                @Override
                public LocalDate deserialize(JsonElement json, Type typeOfT, com.google.gson.JsonDeserializationContext context) throws JsonParseException {
                    return LocalDate.parse(json.getAsString());
                }
            })
            .registerTypeAdapter(LocalDateTime.class, new JsonSerializer<LocalDateTime>() {
                @Override
                public JsonElement serialize(LocalDateTime src, Type typeOfSrc, com.google.gson.JsonSerializationContext context) {
                    return new JsonPrimitive(src.toString());
                }
            })
            .create();

        // Feedback endpoints
        // Add feedback for a video
        post("/feedback/add", (req, res) -> {
            String vid = req.queryParams("id_video");
            if (vid == null) vid = req.queryParams("id");
            String conteudo = req.queryParams("conteudo");
            if (vid == null || conteudo == null || conteudo.trim().isEmpty()) {
                res.status(400);
                return "Faltam dados";
            }
            try {
                int idVideo = Integer.parseInt(vid);
                // validate video exists to avoid FK errors
                model.Video target = videoService.getById(idVideo);
                if (target == null) {
                    res.status(404);
                    return "Vídeo não encontrado";
                }
                model.Feedback f = new model.Feedback();
                f.setIdVideo(idVideo);
                f.setConteudo(conteudo.trim());
                f.setDataFeedback(LocalDateTime.now());
                try {
                    boolean ok = feedbackService.save(f);
                    if (ok) {
                        res.status(201);
                        return "ok";
                    } else {
                        res.status(500);
                        return "Erro ao salvar feedback";
                    }
                } catch (Exception ex) {
                    ex.printStackTrace();
                    res.status(500);
                    return "Erro interno: " + ex.getMessage();
                }
            } catch (NumberFormatException e) {
                res.status(400);
                return "id_video inválido";
            }
        });

        // List feedbacks for a video (return only the content strings)
        get("/feedbacks", (req, res) -> {
            String vid = req.queryParams("videoId");
            if (vid == null) vid = req.queryParams("id_video");
            if (vid == null) vid = req.queryParams("id");
            if (vid == null) {
                res.status(400);
                return "Falta id";
            }
            try {
                int idVideo = Integer.parseInt(vid);
                java.util.List<model.Feedback> list = feedbackService.getByVideo(idVideo);
                java.util.List<String> contents = new java.util.ArrayList<>();
                for (model.Feedback f : list) {
                    contents.add(f.getConteudo());
                }
                res.type("application/json");
                return gson.toJson(contents);
            } catch (NumberFormatException e) {
                res.status(400);
                return "id inválido";
            }
        });

        // Registration endpoint - accepts form POST
        post("/usuario/register", (req, res) -> {
            String nome = req.queryParams("nome");
            String email = req.queryParams("email");
            String senha = req.queryParams("senha");
            String data = req.queryParams("data_nascimento");
            String sexo = req.queryParams("sexo");

            if (nome == null || email == null || senha == null) {
                res.status(400);
                return "Faltam dados obrigatórios";
            }

            Usuario u = new Usuario();
            u.setNome(nome);
            u.setEmail(email);
            u.setSenha(senha);
            try {
                if (data != null && !data.isEmpty()) {
                    u.setDataNascimento(LocalDate.parse(data));
                }
            } catch (DateTimeParseException e) {
                // ignore invalid date, could add validation
            }
            if (sexo != null && sexo.length() > 0) {
                u.setSexo(sexo.charAt(0));
            }

            try {
                boolean ok = usuarioService.register(u);
                if (ok) {
                    // after registration redirect to login
                    res.redirect("/login/login.html");
                    return null;
                } else {
                    res.status(500);
                    return "Erro ao registrar usuário";
                }
            } catch (Exception ex) {
                ex.printStackTrace();
                res.status(500);
                return "Erro interno ao registrar usuário: " + ex.getMessage();
            }
        });

        // Login endpoint
        post("/usuario/login", (req, res) -> {
            String email = req.queryParams("email");
            String senha = req.queryParams("senha");
            if (email == null || senha == null) {
                res.status(400);
                return "Dados inválidos";
            }
            System.out.println("POST /usuario/login email=" + email);
            Usuario u = usuarioService.authenticate(email, senha);
            System.out.println("POST /usuario/login result=" + (u != null ? "ok id=" + u.getIdUsuario() : "null"));
            if (u != null) {
                req.session(true).attribute("usuarioId", u.getIdUsuario());
                // after successful login redirect to dashboard
                res.redirect("/homePage/dashboard.html");
                return null;
            } else {
                // redirect back to login with error
                res.redirect("/login/login.html?error=1");
                return null;
            }
        });

        // Get current logged user data as JSON
        get("/usuario/me", (req, res) -> {
            Integer id = req.session().attribute("usuarioId");
            if (id == null) {
                res.status(401);
                return "{}";
            }
            Usuario u = usuarioService.getById(id);
            res.type("application/json");
            return gson.toJson(u);
        });

        // Update current user
        post("/usuario/me/update", (req, res) -> {
            Integer id = req.session().attribute("usuarioId");
            if (id == null) {
                res.status(401);
                return "Não autenticado";
            }
            Usuario u = usuarioService.getById(id);
            if (u == null) {
                res.status(404);
                return "Usuário não encontrado";
            }

            String nome = req.queryParams("nome");
            String email = req.queryParams("email");
            String data = req.queryParams("data_nascimento");
            String sexo = req.queryParams("sexo");
            String senha = req.queryParams("senha");

            if (nome != null) u.setNome(nome);
            if (email != null) u.setEmail(email);
            if (senha != null && !senha.isEmpty()) u.setSenha(senha);
            try {
                if (data != null && !data.isEmpty()) {
                    u.setDataNascimento(LocalDate.parse(data));
                }
            } catch (DateTimeParseException e) {
                // ignore
            }
            if (sexo != null && sexo.length() > 0) u.setSexo(sexo.charAt(0));

            boolean ok = usuarioService.update(u);
            if (ok) {
                res.redirect("/perfil/perfil.html");
                return null;
            } else {
                res.status(500);
                return "Erro ao atualizar";
            }
        });

        // Logout
        post("/usuario/logout", (req, res) -> {
            req.session().removeAttribute("usuarioId");
            req.session().invalidate();
            res.redirect("/landPage/index.html");
            return null;
        });

        // Delete current user (also remove user's videos and related data)
        post("/usuario/me/delete", (req, res) -> {
            Integer id = req.session().attribute("usuarioId");
            if (id == null) {
                res.status(401);
                return "Não autenticado";
            }
            try {
                // remove videos posted by this user (this also removes feedbacks/favoritos per video)
                boolean vidsOk = videoService.deleteByUsuarioId(id);
                if (!vidsOk) {
                    // log but continue to attempt user deletion
                    System.err.println("Alguns vídeos do usuário id=" + id + " não puderam ser apagados completamente.");
                }
                boolean userOk = usuarioService.delete(id);
                req.session().invalidate();
                if (userOk) {
                    res.redirect("/landPage/index.html");
                    return null;
                } else {
                    res.status(500);
                    return "Erro ao deletar usuário";
                }
            } catch (Exception ex) {
                ex.printStackTrace();
                res.status(500);
                return "Erro interno: " + ex.getMessage();
            }
        });

        // Videos list (all or search)
        get("/videos", (req, res) -> {
            // support search by title (?q=...) or filter by category (?categoria=ID)
            String q = req.queryParams("q");
            String cat = req.queryParams("categoria");
            res.type("application/json");
            if (cat != null && !cat.trim().isEmpty()) {
                try {
                    int cid = Integer.parseInt(cat);
                    return gson.toJson(videoService.getByCategoriaId(cid));
                } catch (Exception e) {
                    // fallthrough to return all
                }
            }
            if (q != null && !q.trim().isEmpty()) {
                return gson.toJson(videoService.searchByTitulo(q));
            } else {
                return gson.toJson(videoService.getAll());
            }
        });

        // Get single video with favorite status for current user
        get("/video/get", (req, res) -> {
            String vid = req.queryParams("id");
            if (vid == null) vid = req.queryParams("id_video");
            if (vid == null) {
                res.status(400);
                return "Falta id";
            }
            int id = Integer.parseInt(vid);
            model.Video v = videoService.getById(id);
            if (v == null) {
                res.status(404);
                return "Vídeo não encontrado";
            }
            Integer uid = req.session().attribute("usuarioId");
            boolean fav = false;
            if (uid != null) {
                fav = favoritoService.getByUserAndVideo(uid, id) != null;
            }
            java.util.Map<String,Object> out = new java.util.HashMap<>();
            out.put("video", v);
            out.put("favorited", fav);
            res.type("application/json");
            System.out.println("[video/get] id=" + id + " uid=" + uid + " favorited=" + fav);
            return gson.toJson(out);
        });

        // Favorited videos of current user (returns video objects)
        get("/favoritos/me", (req, res) -> {
            Integer uid = req.session().attribute("usuarioId");
            if (uid == null) {
                res.status(401);
                return "[]";
            }
            java.util.List<model.Favorito> favoritos = favoritoService.getByUser(uid);
            java.util.List<model.Video> videos = new java.util.ArrayList<>();
            for (model.Favorito f : favoritos) {
                model.Video v = videoService.getById(f.getIdVideo());
                if (v != null) videos.add(v);
            }
            res.type("application/json");
            return gson.toJson(videos);
        });

        // Videos of current user
        get("/videos/me", (req, res) -> {
            Integer uid = req.session().attribute("usuarioId");
            if (uid == null) {
                res.status(401);
                return "[]";
            }
            res.type("application/json");
            return gson.toJson(videoService.getByUsuarioId(uid));
        });

        // Categories for forms
        get("/categorias", (req, res) -> {
            // touch request to avoid unused param warning in some analyzers
            req.session(false);
            res.type("application/json");
            return gson.toJson(categoriaService.getAll());
        });

        // --- Categoria CRUD endpoints (used by categoria UI) ---
        // Add category (expects form param 'nome')
        post("/categoria/add", (req, res) -> {
            String nome = req.queryParams("nome");
            if (nome == null || nome.trim().isEmpty()) {
                res.status(400);
                return "Nome inválido";
            }
            model.Categoria c = new model.Categoria();
            c.setNome(nome.trim());
            try {
                boolean ok = categoriaService.save(c);
                if (ok) {
                    res.status(201);
                    return "ok";
                } else {
                    res.status(500);
                    return "Erro ao salvar";
                }
            } catch (Exception ex) {
                ex.printStackTrace();
                res.status(500);
                return "Erro interno: " + ex.getMessage();
            }
        });

        // Update category (expects 'id' and 'nome')
        post("/categoria/update", (req, res) -> {
            String idp = req.queryParams("id");
            String nome = req.queryParams("nome");
            if (idp == null) {
                res.status(400);
                return "Falta id";
            }
            try {
                int id = Integer.parseInt(idp);
                if (nome == null || nome.trim().isEmpty()) {
                    res.status(400);
                    return "Nome inválido";
                }
                model.Categoria c = categoriaService.getById(id);
                if (c == null) {
                    res.status(404);
                    return "Categoria não encontrada";
                }
                c.setNome(nome.trim());
                boolean ok = categoriaService.update(c);
                if (ok) return "ok"; else { res.status(500); return "Erro ao atualizar"; }
            } catch (NumberFormatException e) {
                res.status(400);
                return "id inválido";
            }
        });

        // Delete category (expects 'id')
        post("/categoria/delete", (req, res) -> {
            String idp = req.queryParams("id");
            if (idp == null) {
                res.status(400);
                return "Falta id";
            }
            try {
                int id = Integer.parseInt(idp);
                // Ensure videos referencing this category are nullified first to avoid FK errors
                try {
                    dao.VideoDAO vdao = new dao.VideoDAO();
                    vdao.nullifyCategoria(id);
                } catch (Exception ex) {
                    ex.printStackTrace();
                    res.status(500);
                    return "Erro ao remover referência da categoria nos vídeos: " + ex.getMessage();
                }

                boolean ok = categoriaService.delete(id);
                if (ok) return "ok"; else { res.status(500); return "Erro ao deletar"; }
            } catch (NumberFormatException e) {
                res.status(400);
                return "id inválido";
            }
        });

        // Add new video (form POST)
        post("/video/add", (req, res) -> {
            Integer uid = req.session().attribute("usuarioId");
            if (uid == null) {
                res.status(401);
                return "Não autenticado";
            }
            String titulo = req.queryParams("nome");
            if (titulo == null) titulo = req.queryParams("titulo");
            String descricao = req.queryParams("descricao");
            String url = req.queryParams("url");
            String cid = req.queryParams("id_categoria");
            String aid = req.queryParams("id_atividade");
            Integer idCategoria = null;
            Integer idAtividade = null;
            try { if (cid != null && !cid.isEmpty()) idCategoria = Integer.parseInt(cid); } catch (Exception e) {}
            try { if (aid != null && !aid.isEmpty()) idAtividade = Integer.parseInt(aid); } catch (Exception e) {}

            model.Video v = new model.Video();
            v.setTitulo(titulo);
            v.setDescricao(descricao);
            v.setUrl(url);
            v.setIdCategoria(idCategoria);
            v.setIdAtividade(idAtividade);
            v.setIdUsuario(uid);

            boolean ok = videoService.save(v);
            if (ok) {
                res.redirect("/minhasAulas/minhasAulas.html");
                return null;
            } else {
                res.status(500);
                return "Erro ao salvar vídeo";
            }
        });

        // Update video (form POST)
        post("/video/update", (req, res) -> {
            Integer uid = req.session().attribute("usuarioId");
            if (uid == null) {
                res.status(401);
                return "Não autenticado";
            }
            String idParam = req.queryParams("id");
            if (idParam == null) idParam = req.queryParams("id_video");
            if (idParam == null) idParam = req.queryParams("idVideo");
            if (idParam == null) {
                res.status(400);
                return "Falta id";
            }
            int id = Integer.parseInt(idParam);
            model.Video existing = videoService.getById(id);
            if (existing == null) {
                res.status(404);
                return "Vídeo não encontrado";
            }
            // only owner can update
            if (existing.getIdUsuario() == null || !existing.getIdUsuario().equals(uid)) {
                res.status(403);
                return "Sem permissão";
            }
            String titulo = req.queryParams("titulo");
            String descricao = req.queryParams("descricao");
            String url = req.queryParams("url");
            String cid = req.queryParams("id_categoria");
            Integer idCategoria = existing.getIdCategoria();
            try {
                if (cid != null) {
                    if (cid.trim().isEmpty()) {
                        // explicit empty -> remove category
                        idCategoria = null;
                    } else {
                        idCategoria = Integer.parseInt(cid);
                    }
                }
            } catch (Exception e) {
                // keep existing idCategoria on parse error
            }

            if (titulo != null) existing.setTitulo(titulo);
            if (descricao != null) existing.setDescricao(descricao);
            if (url != null) existing.setUrl(url);
            existing.setIdCategoria(idCategoria);

            boolean ok = videoService.update(existing);
            if (ok) {
                res.redirect("/minhasAulas/minhasAulas.html");
                return null;
            } else {
                res.status(500);
                return "Erro ao atualizar vídeo";
            }
        });

        // Delete video
        post("/video/delete", (req, res) -> {
            Integer uid = req.session().attribute("usuarioId");
            if (uid == null) {
                res.status(401);
                return "Não autenticado";
            }
            String idParam = req.queryParams("id");
            if (idParam == null) {
                res.status(400);
                return "Falta id";
            }
            int id = Integer.parseInt(idParam);
            model.Video v = videoService.getById(id);
            if (v == null) {
                res.status(404);
                return "Vídeo não encontrado";
            }
            if (v.getIdUsuario() == null || !v.getIdUsuario().equals(uid)) {
                res.status(403);
                return "Sem permissão";
            }
            boolean ok = videoService.delete(id);
            if (ok) {
                res.redirect("/minhasAulas/minhasAulas.html");
                return null;
            } else {
                res.status(500);
                return "Erro ao excluir";
            }
        });

        // Add favorite
        post("/favorito/add", (req, res) -> {
            Integer uid = req.session().attribute("usuarioId");
            if (uid == null) {
                res.status(401);
                return "Não autenticado";
            }
            String vid = req.queryParams("id_video");
            if (vid == null) vid = req.queryParams("id");
            if (vid == null) {
                res.status(400);
                return "Falta id_video";
            }
            int idVideo = Integer.parseInt(vid);
            boolean ok = favoritoService.addFavorite(uid, idVideo);
            System.out.println("[favorito/add] uid=" + uid + " idVideo=" + idVideo + " ok=" + ok);
            if (ok) {
                res.status(200);
                return "ok";
            } else {
                res.status(409);
                return "já favoritado";
            }
        });

        // Remove favorite
        post("/favorito/remove", (req, res) -> {
            Integer uid = req.session().attribute("usuarioId");
            if (uid == null) {
                res.status(401);
                return "Não autenticado";
            }
            String vid = req.queryParams("id_video");
            if (vid == null) vid = req.queryParams("id");
            if (vid == null) {
                res.status(400);
                return "Falta id_video";
            }
            int idVideo = Integer.parseInt(vid);
            boolean ok = favoritoService.removeFavoriteByUserAndVideo(uid, idVideo);
            System.out.println("[favorito/remove] uid=" + uid + " idVideo=" + idVideo + " ok=" + ok);
            if (ok) {
                res.status(200);
                return "removed";
            } else {
                res.status(404);
                return "not found";
            }
        });

        // Check if current user favorited a video
        get("/favorito/check", (req, res) -> {
            Integer uid = req.session().attribute("usuarioId");
            String vid = req.queryParams("id_video");
            if (vid == null) vid = req.queryParams("id");
            if (vid == null) {
                res.status(400);
                return "Falta id_video";
            }
            int idVideo = Integer.parseInt(vid);
            boolean fav = false;
            if (uid != null) {
                fav = favoritoService.getByUserAndVideo(uid, idVideo) != null;
            }
            System.out.println("[favorito/check] uid=" + uid + " idVideo=" + idVideo + " favorited=" + fav);
            res.type("application/json");
            java.util.Map<String,Object> resp = new java.util.HashMap<>();
            resp.put("favorited", fav);
            return gson.toJson(resp);
        });

        System.out.println("Servidor rodando em: http://localhost:4567/");
    }
}
