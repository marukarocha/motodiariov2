import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/db/firebaseServices";
import { doc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SwitchProps {
  onSwitch: (view: "login" | "register" | "forgot") => void;
}

interface RegisterFormInputs {
  email: string;
  password: string;
  confirm: string;
}

export default function RegisterForm({ onSwitch }: SwitchProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>();
  const router = useRouter();
  const { toast } = useToast();

  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    if (data.password !== data.confirm) {
      toast({ title: "Senhas não coincidem", variant: "destructive" });
      return;
    }

    try {
      const result = await createUserWithEmailAndPassword(auth, data.email, data.password);

      const user = result.user;

      // Criar o documento na coleção "users" com role padrão
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: "user", // padrão inicial
        createdAt: new Date(),
      });

      // Opcional: você pode já criar subcoleções como configurations se quiser
      await setDoc(doc(db, "users", user.uid, "configurations", "user"), {
        firstName: "",
        lastName: "",
        nickname: "",
      });

      toast({ title: "Cadastro realizado com sucesso!" });
      router.push("/");
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full p-6 md:p-8">
      <h1 className="text-2xl font-bold">Crie sua conta</h1>

      <div className="flex flex-col">
        <Input
          type="email"
          placeholder="Seu e-mail"
          className={cn(errors.email && "border-red-500")}
          {...register("email", {
            required: "Informe um e-mail.",
            pattern: { value: /\S+@\S+\.\S+/, message: "Formato de e-mail inválido." },
          })}
        />
        {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
      </div>

      <div className="flex flex-col">
        <Input
          type="password"
          placeholder="Crie uma senha"
          className={cn(errors.password && "border-red-500")}
          {...register("password", {
            required: "Informe uma senha.",
            minLength: { value: 6, message: "A senha deve ter pelo menos 6 caracteres." },
          })}
        />
        {errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}
      </div>

      <div className="flex flex-col">
        <Input
          type="password"
          placeholder="Confirme sua senha"
          className={cn(errors.confirm && "border-red-500")}
          {...register("confirm", { required: "Confirme sua senha." })}
        />
        {errors.confirm && <span className="text-xs text-red-500">{errors.confirm.message}</span>}
      </div>

      <Button type="submit" className="w-full hover:bg-primary hover:text-white transition-colors">
        Cadastrar
      </Button>
      <div className="text-center text-sm">
        Já tem uma conta?{" "}
        <button type="button" onClick={() => onSwitch("login")} className="underline hover:text-primary">
          Faça login
        </button>
      </div>
    </form>
  );
}
