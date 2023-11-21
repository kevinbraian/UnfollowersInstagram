/*Esta función obtiene el valor de una cookie específica del navegador. 
  Es utilizada para acceder a las cookies csrftoken y ds_user_id, necesarias para autenticarse y realizar operaciones en Instagram.*/

function getCookie(b) {
  let c = `; ${document.cookie}`,
    a = c.split(`; ${b}=`);
  if (2 === a.length) return a.pop().split(";").shift();
}
/*Esta función crea una promesa que se resuelve después de un tiempo definido (a milisegundos). 
  Se utiliza para pausar la ejecución del script, lo que puede ayudar a evitar bloqueos temporales por hacer demasiadas solicitudes en un corto período de tiempo.*/

function sleep(a) {
  return new Promise((b) => {
    setTimeout(b, a);
  });
}
/*Genera una URL para la API de Instagram que obtiene la siguiente página de personas seguidas por el usuario. 
  Utiliza el cursor de paginación (a) para cargar los siguientes resultados.*/

function afterUrlGenerator(a) {
  return `https://www.instagram.com/graphql/query/?query_hash=3dec7e2c57367ef3da3d987d89f9dbc8&variables={"id":"${ds_user_id}","include_reel":"true","fetch_mutual":"false","first":"24","after":"${a}"}`;
}
/*Genera una URL para la acción de dejar de seguir a un usuario en Instagram, usando el ID del usuario (a).*/

function unfollowUserUrlGenerator(a) {
  return `https://www.instagram.com/web/friendships/${a}/unfollow/`;
}
/*Estas variables almacenan información clave para el proceso del script, como tokens de autenticación,
 la lista de usuarios seguidos, y contadores para el progreso y control de flujo del script.*/

let followedPeople,
  csrftoken = getCookie("csrftoken"),
  ds_user_id = getCookie("ds_user_id"),
  initialURL = `https://www.instagram.com/graphql/query/?query_hash=3dec7e2c57367ef3da3d987d89f9dbc8&variables={"id":"${ds_user_id}","include_reel":"true","fetch_mutual":"false","first":"24"}`,
  doNext = !0,
  filteredList = [],
  getUnfollowCounter = 0,
  scrollCicle = 0;

/*Esta es la función principal que ejecuta el script. Realiza lo siguiente:
  Utiliza un bucle para cargar a todos los usuarios seguidos.
  Filtra y almacena los usuarios que no siguen de vuelta al usuario.
  Muestra el progreso en la consola.
  Descarga los resultados como un archivo JSON una vez que se completa el proceso. */  

async function startScript() {
  for (var c, d, e, b, f, g = Math.floor; doNext; ) {
    let a;
    try {
      a = await fetch(initialURL).then((a) => a.json());
    } catch (h) {
      continue;
    }
    followedPeople || (followedPeople = a.data.user.edge_follow.count),
      (doNext = a.data.user.edge_follow.page_info.has_next_page),
      (initialURL = afterUrlGenerator(
        a.data.user.edge_follow.page_info.end_cursor
      )),
      (getUnfollowCounter += a.data.user.edge_follow.edges.length),
      a.data.user.edge_follow.edges.forEach((a) => {
        a.node.follows_viewer || filteredList.push(a.node);
      }),
      console.clear(),
      console.log(
        `%c Progress ${getUnfollowCounter}/${followedPeople} (${parseInt(
          100 * (getUnfollowCounter / followedPeople)
        )}%)`,
        "background: #222; color: #bada55;font-size: 35px;"
      ),
      console.log(
        "%c This users don't follow you (Still in progress)",
        "background: #222; color: #FC4119;font-size: 13px;"
      ),
      filteredList.forEach((a) => {
        console.log(a.username);
      }),
      await sleep(g(400 * Math.random()) + 1e3),
      scrollCicle++,
      6 < scrollCicle &&
        ((scrollCicle = 0),
        console.log(
          "%c Sleeping 10 secs to prevent getting temp blocked",
          "background: #222; color: ##FF0000;font-size: 35px;"
        ),
        await sleep(1e4));
  }
  (c = JSON.stringify(filteredList)),
    (d = "usersNotFollowingBack.json"),
    (e = "application/json"),
    (b = document.createElement("a")),
    (f = new Blob([c], { type: e })),
    (b.href = URL.createObjectURL(f)),
    (b.download = d),
    b.click(),
    console.log(
      "%c All DONE!",
      "background: #222; color: #bada55;font-size: 25px;"
    );
}

startScript();
