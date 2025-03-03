"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { updatePassword } from "firebase/auth";
import { getUserProfile, updateUserProfile } from "@/lib/db/firebaseServices";
import { useAuth } from "@/components/USER/Auth/AuthContext";
import { IMaskInput } from "react-imask";

// Listas fixas para os dropdowns
const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const licenseCategories = ["A", "B", "AB", "C", "D", "E"];

/**
 * Schema de validação com Zod.
 * O campo newPassword permite "" (vazio) ou uma string com no mínimo 6 caracteres.
 */
const profileSchema = z.object({
  firstName: z.string().min(1, { message: "Nome é obrigatório" }),
  lastName: z.string().min(1, { message: "Sobrenome é obrigatório" }),
  nickname: z.string().optional(),
  useNickname: z.boolean().optional(),
  phone: z.string().min(1, { message: "Telefone principal é obrigatório" }),
  email: z.string().email({ message: "Email inválido" }),
  bloodType: z.string().optional(),
  emergencyPhone: z.string().optional(),
  birthYear: z.preprocess(
    (val) => (typeof val === "string" ? parseInt(val as string, 10) : val),
    z.number().min(1900, { message: "Ano de nascimento inválido" })
  ),
  licenseCategory: z.string().optional(),
  newPassword: z.union([
    z.literal(""),
    z.string().min(6, { message: "A nova senha deve ter pelo menos 6 caracteres" }),
  ]).optional(),
});

type ProfileData = z.infer<typeof profileSchema>;

const defaultValues: ProfileData = {
  firstName: "",
  lastName: "",
  nickname: "",
  useNickname: false,
  phone: "",
  email: "",
  bloodType: "",
  emergencyPhone: "",
  birthYear: new Date().getFullYear(),
  licenseCategory: "",
  newPassword: "",
};

// Componente de input mascarado utilizando react-imask
function MaskedInput(props: any) {
  return (
    <IMaskInput
      {...props}
      mask="(00) 00000-0000"
      unmask={false}
      overwrite
      render={(ref, inputProps) => <Input ref={ref} {...inputProps} />}
    />
  );
}

export default function Person() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>("");

  const form = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues,
    mode: "onSubmit",
  });
  const { handleSubmit, reset, control, formState: { errors } } = form;

  // Carrega os dados do perfil
  useEffect(() => {
    async function fetchProfile() {
      if (!currentUser) return;
      setLoading(true);
      try {
        const profile = await getUserProfile(currentUser.uid);
        if (profile) {
          reset({
            firstName: profile.firstName || "",
            lastName: profile.lastName || "",
            nickname: profile.nickname || "",
            useNickname: profile.useNickname || false,
            phone: profile.phone || "",
            email: currentUser.email,
            bloodType: profile.bloodType || "",
            emergencyPhone: profile.emergencyPhone || "",
            birthYear: profile.birthYear || new Date().getFullYear(),
            licenseCategory: profile.licenseCategory || "",
            newPassword: "",
          });
          if (profile.profileImageUrl) {
            setProfileImagePreview(profile.profileImageUrl);
          }
        } else {
          reset({ ...defaultValues, email: currentUser.email });
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar seu perfil.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    if (currentUser) fetchProfile();
  }, [currentUser, reset, toast]);

  // Função de upload da imagem (placeholder)
  async function uploadProfileImage(userId: string, file: File): Promise<string> {
    return "https://via.placeholder.com/150";
  }

  async function onSubmit(data: ProfileData) {
    setLoading(true);
    try {
      if (!currentUser) throw new Error("Usuário não autenticado");

      if (data.newPassword && data.newPassword.trim() !== "") {
        try {
          await updatePassword(currentUser, data.newPassword);
        } catch (err: any) {
          if (err.code === "auth/requires-recent-login") {
            toast({
              title: "Reautenticação Necessária",
              description: "Por favor, faça login novamente para alterar sua senha.",
              variant: "destructive",
            });
            return;
          } else {
            throw err;
          }
        }
      }

      const { newPassword, ...profileData } = data;

      if (profileImage) {
        const profileImageUrl = await uploadProfileImage(currentUser.uid, profileImage);
        profileData.profileImageUrl = profileImageUrl;
      }

      await updateUserProfile(currentUser.uid, profileData);
      toast({
        title: "Sucesso!",
        description: "Perfil atualizado com sucesso!",
      });
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o perfil.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleProfileImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfileImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  return (
    <div>
      {/* Seção de imagem de perfil */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-300">
          {profileImagePreview ? (
            <img src={profileImagePreview} alt="Profile" className="object-cover w-full h-full" />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-500">Avatar</div>
          )}
        </div>
        <label className="mt-2 cursor-pointer text-blue-500 hover:underline">
          Alterar Imagem
          <input type="file" accept="image/*" onChange={handleProfileImageChange} className="hidden" />
        </label>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Nome" {...field} className={`text-sm ${errors.firstName ? "border-red-500" : ""}`} />
                  </FormControl>
                  {errors.firstName && <FormMessage>{errors.firstName.message}</FormMessage>}
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Sobrenome" {...field} className={`text-sm ${errors.lastName ? "border-red-500" : ""}`} />
                  </FormControl>
                  {errors.lastName && <FormMessage>{errors.lastName.message}</FormMessage>}
                </FormItem>
              )}
            />
            <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
              <FormField
                control={control}
                name="nickname"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="Apelido" {...field} className={`text-sm ${errors.nickname ? "border-red-500" : ""}`} />
                    </FormControl>
                    {errors.nickname && <FormMessage>{errors.nickname.message}</FormMessage>}
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="useNickname"
                render={({ field }) => (
                  <FormItem className="flex items-center">
                    <FormControl>
                      <input type="checkbox" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} className="h-4 w-4" />
                    </FormControl>
                    <span className="ml-2 text-sm">Usar Apelido</span>
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <MaskedInput
                        placeholder="Telefone Principal"
                        value={field.value}
                        onChange={field.onChange}
                        className={`w-full rounded-md border bg-transparent px-3 py-1 shadow-sm transition-colors ${errors.phone ? "border-red-500" : ""}`}
                      />
                    </FormControl>
                    {errors.phone && <FormMessage>{errors.phone.message}</FormMessage>}
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="emergencyPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <MaskedInput
                        placeholder="Telefone de Emergência"
                        value={field.value}
                        onChange={field.onChange}
                        className={`w-full rounded-md border bg-transparent px-3 py-1 shadow-sm transition-colors ${errors.emergencyPhone ? "border-red-500" : ""}`}
                      />
                    </FormControl>
                    {errors.emergencyPhone && <FormMessage>{errors.emergencyPhone.message}</FormMessage>}
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Email" disabled {...field} className="text-sm " />
                  </FormControl>
                  {errors.email && <FormMessage>{errors.email.message}</FormMessage>}
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="bloodType"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className={`text-sm bg-[#1c1b22] ${errors.bloodType ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="Tipo Sanguíneo" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1c1b22]">
                        {bloodTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  {errors.bloodType && <FormMessage>{errors.bloodType.message}</FormMessage>}
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="licenseCategory"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className={`text-sm bg-[#1c1b22] ${errors.licenseCategory ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="Categoria Habilitação" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1c1b22]">
                        {licenseCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  {errors.licenseCategory && <FormMessage>{errors.licenseCategory.message}</FormMessage>}
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="birthYear"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="number" placeholder="Ano de Nascimento" {...field} className={`text-sm ${errors.birthYear ? "border-red-500" : ""}`} />
                  </FormControl>
                  {errors.birthYear && <FormMessage>{errors.birthYear.message}</FormMessage>}
                </FormItem>
              )}
            />
          </div>

          <div className="mt-4">
            <FormField
              control={control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="password" placeholder="Nova Senha (opcional)" {...field} className={`text-sm ${errors.newPassword ? "border-red-500" : ""}`} />
                  </FormControl>
                  {errors.newPassword && <FormMessage>{errors.newPassword.message}</FormMessage>}
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" disabled={loading} className="bg-green-500 hover:bg-green-600 mt-6 w-full">
            {loading ? "Salvando..." : "Salvar Perfil"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
