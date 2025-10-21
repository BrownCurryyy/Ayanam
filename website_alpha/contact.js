const supabaseUrl = 'env.PROJECT_URL';
const supabaseKey = 'env.PUBLIC_ANON_KEY';
const supabase = Supabase.createClient(supabaseUrl, supabaseKey);

const form = document.getElementById('contactForm');
const statusMsg = document.getElementById('statusMsg');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();

  if(!name || !email || !message){
    statusMsg.textContent = "Fill all fields!";
    statusMsg.style.color = 'red';
    return;
  }

  const { data, error } = await supabase.from('contacts').insert([
    { name, email, message }
  ]);

  if(error){
    statusMsg.textContent = "Something went wrong!";
    statusMsg.style.color = 'red';
    console.error(error);
  } else {
    statusMsg.textContent = "Message sent! We'll get back to you soon.";
    statusMsg.style.color = '#feaa7c';
    form.reset();
  }
});
