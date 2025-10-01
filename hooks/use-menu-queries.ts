import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { menuService } from "@/lib/services/menu-service";
import { CreateMenuInput, UpdateMenuInput } from "@/lib/types";
import { toast } from "sonner";

// Query keys for consistent caching
export const menuQueryKeys = {
  all: ["menus"] as const,
  lists: () => [...menuQueryKeys.all, "list"] as const,
  list: (filters: string) => [...menuQueryKeys.lists(), { filters }] as const,
  details: () => [...menuQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...menuQueryKeys.details(), id] as const,
};

// Hook to get all menus
export function useMenus() {
  return useQuery({
    queryKey: menuQueryKeys.lists(),
    queryFn: menuService.getMenus,
  });
}

// Hook to get a single menu
export function useMenu(id: string) {
  return useQuery({
    queryKey: menuQueryKeys.detail(id),
    queryFn: () => menuService.getMenu(id),
    enabled: !!id, // Only run query if id exists
  });
}

// Hook to create a new menu
export function useCreateMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateMenuInput) => menuService.createMenu(input),
    onSuccess: (data) => {
      // Invalidate and refetch menus list
      queryClient.invalidateQueries({ queryKey: menuQueryKeys.lists() });

      // Show success toast
      toast.success("メニューを作成しました", {
        description: `「${data.name}」が正常に保存されました。`,
      });
    },
    onError: (error: any) => {
      // Show error toast
      toast.error("メニューの作成に失敗しました", {
        description: error?.message || "不明なエラーが発生しました。もう一度お試しください。",
      });
    },
  });
}

// Hook to update an existing menu
export function useUpdateMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateMenuInput) => menuService.updateMenu(input),
    onSuccess: (updatedMenu) => {
      // Invalidate and refetch menus list
      queryClient.invalidateQueries({ queryKey: menuQueryKeys.lists() });

      // Update the specific menu cache
      queryClient.setQueryData(menuQueryKeys.detail(updatedMenu.id), updatedMenu);

      // Show success toast
      toast.success("メニューを更新しました", {
        description: `「${updatedMenu.name}」の変更が保存されました。`,
      });
    },
    onError: (error: any) => {
      // Show error toast
      toast.error("メニューの更新に失敗しました", {
        description: error?.message || "不明なエラーが発生しました。もう一度お試しください。",
      });
    },
  });
}

// Hook to delete a menu
export function useDeleteMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => menuService.deleteMenu(id),
    onSuccess: (_, deletedId) => {
      // Get the menu name before deletion for toast
      const menuData = queryClient.getQueryData(menuQueryKeys.detail(deletedId)) as any;
      const menuName = menuData?.name || "メニュー";

      // Remove the menu from the list cache
      queryClient.setQueryData(menuQueryKeys.lists(), (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.filter((menu: any) => menu.id !== deletedId);
      });

      // Remove the specific menu from cache
      queryClient.removeQueries({ queryKey: menuQueryKeys.detail(deletedId) });

      // Show success toast
      toast.success("メニューを削除しました", {
        description: `「${menuName}」が正常に削除されました。`,
      });
    },
    onError: (error: any) => {
      // Show error toast
      toast.error("メニューの削除に失敗しました", {
        description: error?.message || "不明なエラーが発生しました。もう一度お試しください。",
      });
    },
  });
}

// Hook to save a menu (create or update)
export function useSaveMenu() {
  const createMenu = useCreateMenu();
  const updateMenu = useUpdateMenu();

  return {
    saveMenu: async (input: CreateMenuInput | UpdateMenuInput) => {
      if ("id" in input) {
        return updateMenu.mutateAsync(input);
      } else {
        return createMenu.mutateAsync(input);
      }
    },
    isLoading: createMenu.isPending || updateMenu.isPending,
    error: createMenu.error || updateMenu.error,
  };
}
