
import * as React from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import KnowledgeBaseManager from "./pages/KnowledgeBaseManager";
import KnowledgeBaseDetail from "./pages/KnowledgeBaseDetail";
import DocumentDetail from "./pages/DocumentDetail";
import TaskManager from "./pages/TaskManager";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/knowledge-bases" element={<KnowledgeBaseManager />} />
              <Route path="/knowledge-bases/:kbId" element={<KnowledgeBaseDetail />} />
              <Route path="/knowledge-bases/:kbId/documents/:docId" element={<DocumentDetail />} />
              <Route path="/tasks" element={<TaskManager />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;
