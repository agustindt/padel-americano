/** Evita flash de tema: corre antes del primer paint. */
export function ThemeScript() {
  const code = `try{var k="americano-theme";var s=localStorage.getItem(k);var d=document.documentElement;if(s==="dark"){d.classList.add("dark");}else if(s==="light"){d.classList.remove("dark");}else if(window.matchMedia("(prefers-color-scheme:dark)").matches){d.classList.add("dark");}else{d.classList.remove("dark");}}catch(e){}`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
